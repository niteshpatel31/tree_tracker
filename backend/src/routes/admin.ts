import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, citizensTable, forestOfficersTable } from "../db";
import crypto from "crypto";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, "treetrack-india-salt-v2", 12000, 64, "sha512").toString("hex");
}

// GET /api/admin/users - List all users
router.get("/admin/users", async (_req, res): Promise<void> => {
  try {
    const citizens = await db.select({
      id: citizensTable.id,
      name: citizensTable.name,
      email: citizensTable.email,
      role: "citizen" as const,
      state: citizensTable.state,
      createdAt: citizensTable.createdAt,
    }).from(citizensTable);

    const officers = await db.select({
      id: forestOfficersTable.id,
      name: forestOfficersTable.name,
      email: forestOfficersTable.email,
      role: "officer" as const,
      state: forestOfficersTable.state,
      employeeId: forestOfficersTable.employeeId,
      department: forestOfficersTable.department,
      designation: forestOfficersTable.designation,
      verificationStatus: forestOfficersTable.verificationStatus,
      createdAt: forestOfficersTable.createdAt,
    }).from(forestOfficersTable);

    const users = [
      ...citizens.map(c => ({ ...c, type: 'citizen' as const })),
      ...officers.map(o => ({ ...o, type: 'officer' as const }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ users, total: users.length });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// POST /api/admin/users - Create new user
router.post("/admin/users", async (req, res): Promise<void> => {
  try {
    const { name, email, password, role, state, employeeId, department, designation } = req.body as Record<string, string>;

    if (!name?.trim() || !email?.trim() || !password || !role || !state) {
      return res.status(400).json({ error: "Name, email, password, role, and state are required." });
    }

    if (role === "officer" && (!employeeId?.trim() || !department || !designation)) {
      return res.status(400).json({ error: "Employee ID, department, and designation are required for officers." });
    }

    // Check if email already exists
    const existingCitizen = await db.select().from(citizensTable).where(eq(citizensTable.email, email.toLowerCase().trim())).limit(1);
    const existingOfficer = await db.select().from(forestOfficersTable).where(eq(forestOfficersTable.email, email.toLowerCase().trim())).limit(1);

    if (existingCitizen.length > 0 || existingOfficer.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    if (role === "officer" && employeeId) {
      const existingEmpId = await db.select().from(forestOfficersTable).where(eq(forestOfficersTable.employeeId, employeeId.trim().toUpperCase())).limit(1);
      if (existingEmpId.length > 0) {
        return res.status(409).json({ error: "This Employee ID is already registered." });
      }
    }

    if (role === "citizen") {
      const [citizen] = await db.insert(citizensTable).values({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: hashPassword(password),
        state,
      }).returning();

      res.status(201).json({
        user: {
          id: citizen.id,
          name: citizen.name,
          email: citizen.email,
          role: "citizen",
          state: citizen.state,
          createdAt: citizen.createdAt,
          type: 'citizen'
        }
      });
    } else if (role === "officer") {
      const [officer] = await db.insert(forestOfficersTable).values({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: hashPassword(password),
        state,
        employeeId: employeeId!.trim().toUpperCase(),
        department,
        designation,
        verificationStatus: "verified", // Admin created, so auto-verify
      }).returning();

      res.status(201).json({
        user: {
          id: officer.id,
          name: officer.name,
          email: officer.email,
          role: "officer",
          state: officer.state,
          employeeId: officer.employeeId,
          department: officer.department,
          designation: officer.designation,
          verificationStatus: officer.verificationStatus,
          createdAt: officer.createdAt,
          type: 'officer'
        }
      });
    } else {
      res.status(400).json({ error: "Invalid role. Must be 'citizen' or 'officer'." });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// PUT /api/admin/users/:id - Update user
router.put("/admin/users/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const { name, email, state, employeeId, department, designation, verificationStatus } = req.body as Record<string, string>;

    // Check if user exists
    const [citizen] = await db.select().from(citizensTable).where(eq(citizensTable.id, id)).limit(1);
    const [officer] = await db.select().from(forestOfficersTable).where(eq(forestOfficersTable.id, id)).limit(1);

    const user = citizen || officer;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isCitizen = !!citizen;

    // Check email uniqueness if changing
    if (email && email.toLowerCase().trim() !== user.email) {
      const existingCitizen = await db.select().from(citizensTable).where(eq(citizensTable.email, email.toLowerCase().trim())).limit(1);
      const existingOfficer = await db.select().from(forestOfficersTable).where(eq(forestOfficersTable.email, email.toLowerCase().trim())).limit(1);
      if ((existingCitizen.length > 0 && existingCitizen[0].id !== id) || (existingOfficer.length > 0 && existingOfficer[0].id !== id)) {
        return res.status(409).json({ error: "An account with this email already exists." });
      }
    }

    if (isCitizen) {
      const updateData: Record<string, unknown> = {};
      if (name) updateData.name = name.trim();
      if (email) updateData.email = email.toLowerCase().trim();
      if (state) updateData.state = state;

      const [updated] = await db.update(citizensTable).set(updateData).where(eq(citizensTable.id, id)).returning();

      res.json({
        user: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: "citizen",
          state: updated.state,
          createdAt: updated.createdAt,
          type: 'citizen'
        }
      });
    } else {
      const updateData: Record<string, unknown> = {};
      if (name) updateData.name = name.trim();
      if (email) updateData.email = email.toLowerCase().trim();
      if (state) updateData.state = state;
      if (employeeId) updateData.employeeId = employeeId.trim().toUpperCase();
      if (department) updateData.department = department;
      if (designation) updateData.designation = designation;
      if (verificationStatus) updateData.verificationStatus = verificationStatus;

      const [updated] = await db.update(forestOfficersTable).set(updateData).where(eq(forestOfficersTable.id, id)).returning();

      res.json({
        user: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: "officer",
          state: updated.state,
          employeeId: updated.employeeId,
          department: updated.department,
          designation: updated.designation,
          verificationStatus: updated.verificationStatus,
          createdAt: updated.createdAt,
          type: 'officer'
        }
      });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete("/admin/users/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Check if user exists and delete
    const citizenResult = await db.delete(citizensTable).where(eq(citizensTable.id, id)).returning();
    const officerResult = await db.delete(forestOfficersTable).where(eq(forestOfficersTable.id, id)).returning();

    if (citizenResult.length === 0 && officerResult.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
