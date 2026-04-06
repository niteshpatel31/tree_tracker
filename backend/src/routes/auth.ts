import { Router } from "express";
import { db } from "../db";
import { citizensTable, forestOfficersTable } from "../db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, "treetrack-india-salt-v2", 12000, 64, "sha512").toString("hex");
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── CITIZEN ROUTES ───────────────────────────────────────────────

// POST /api/auth/citizen/signup
router.post("/auth/citizen/signup", async (req, res) => {
  const { name, email, password, state } = req.body as Record<string, string>;
  if (!name?.trim() || !email?.trim() || !password || !state) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const existing = await db.select({ id: citizensTable.id }).from(citizensTable)
    .where(eq(citizensTable.email, email.toLowerCase().trim())).limit(1);
  if (existing.length > 0) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }

  const token = generateToken();
  const [citizen] = await db.insert(citizensTable).values({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: hashPassword(password),
    state,
    sessionToken: token,
  }).returning();

  res.status(201).json({
    user: { id: citizen.id, name: citizen.name, email: citizen.email, role: "citizen", state: citizen.state, createdAt: citizen.createdAt },
    token,
  });
});

// POST /api/auth/citizen/login
router.post("/auth/citizen/login", async (req, res) => {
  const { email, password } = req.body as Record<string, string>;
  if (!email?.trim() || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const [citizen] = await db.select().from(citizensTable)
    .where(eq(citizensTable.email, email.toLowerCase().trim())).limit(1);

  if (!citizen || citizen.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = generateToken();
  await db.update(citizensTable).set({ sessionToken: token }).where(eq(citizensTable.id, citizen.id));

  res.json({
    user: { id: citizen.id, name: citizen.name, email: citizen.email, role: "citizen", state: citizen.state, createdAt: citizen.createdAt },
    token,
  });
});

// ─── FOREST OFFICER ROUTES ────────────────────────────────────────

// POST /api/auth/officer/signup
router.post("/auth/officer/signup", async (req, res) => {
  const { name, email, password, state, employeeId, department, designation } = req.body as Record<string, string>;
  if (!name?.trim() || !email?.trim() || !password || !state || !employeeId?.trim() || !department || !designation) {
    return res.status(400).json({ error: "All fields are required." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Officers require a minimum 8-character password." });
  }

  const existingEmail = await db.select({ id: forestOfficersTable.id }).from(forestOfficersTable)
    .where(eq(forestOfficersTable.email, email.toLowerCase().trim())).limit(1);
  if (existingEmail.length > 0) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }

  const existingEmpId = await db.select({ id: forestOfficersTable.id }).from(forestOfficersTable)
    .where(eq(forestOfficersTable.employeeId, employeeId.trim().toUpperCase())).limit(1);
  if (existingEmpId.length > 0) {
    return res.status(409).json({ error: "This Employee ID is already registered." });
  }

  const otp = generateOtp();
  const [officer] = await db.insert(forestOfficersTable).values({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: hashPassword(password),
    state,
    employeeId: employeeId.trim().toUpperCase(),
    department,
    designation,
    verificationStatus: "pending",
    verificationOtp: otp,
  }).returning();

  // In production this OTP would be emailed to the officer's government email.
  // For this system, we return it to show on screen.
  res.status(201).json({ officerId: officer.id, otp });
});

// POST /api/auth/officer/verify
router.post("/auth/officer/verify", async (req, res) => {
  const { officerId, otp } = req.body as { officerId: number; otp: string };
  if (!officerId || !otp) {
    return res.status(400).json({ error: "Officer ID and OTP are required." });
  }

  const [officer] = await db.select().from(forestOfficersTable)
    .where(eq(forestOfficersTable.id, officerId)).limit(1);

  if (!officer) {
    return res.status(404).json({ error: "Officer account not found." });
  }
  if (officer.verificationStatus === "verified") {
    return res.status(400).json({ error: "Account already verified." });
  }
  if (officer.verificationOtp !== otp.trim()) {
    return res.status(401).json({ error: "Invalid OTP. Please try again." });
  }

  const token = generateToken();
  await db.update(forestOfficersTable).set({
    verificationStatus: "verified",
    verificationOtp: null,
    sessionToken: token,
  }).where(eq(forestOfficersTable.id, officerId));

  res.json({
    user: { id: officer.id, name: officer.name, email: officer.email, role: "officer", state: officer.state, department: officer.department, designation: officer.designation, employeeId: officer.employeeId, createdAt: officer.createdAt },
    token,
  });
});

// POST /api/auth/officer/login
router.post("/auth/officer/login", async (req, res) => {
  const { email, password } = req.body as Record<string, string>;
  if (!email?.trim() || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const [officer] = await db.select().from(forestOfficersTable)
    .where(eq(forestOfficersTable.email, email.toLowerCase().trim())).limit(1);

  if (!officer || officer.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  if (officer.verificationStatus !== "verified") {
    return res.status(403).json({ error: "Account not verified. Please complete OTP verification first.", officerId: officer.id });
  }

  const token = generateToken();
  await db.update(forestOfficersTable).set({ sessionToken: token }).where(eq(forestOfficersTable.id, officer.id));

  res.json({
    user: { id: officer.id, name: officer.name, email: officer.email, role: "officer", state: officer.state, department: officer.department, designation: officer.designation, employeeId: officer.employeeId, createdAt: officer.createdAt },
    token,
  });
});

// ─── SHARED ROUTES ────────────────────────────────────────────────

// POST /api/auth/logout
router.post("/auth/logout", async (req, res) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const userType = req.headers["x-user-type"] as string;

  if (token) {
    if (userType === "officer") {
      await db.update(forestOfficersTable).set({ sessionToken: null }).where(eq(forestOfficersTable.sessionToken, token));
    } else {
      await db.update(citizensTable).set({ sessionToken: null }).where(eq(citizensTable.sessionToken, token));
    }
  }
  res.json({ success: true });
});

// GET /api/auth/me
router.get("/auth/me", async (req, res) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const userType = req.headers["x-user-type"] as string;

  if (!token) return res.json({ user: null });

  if (userType === "officer") {
    const [officer] = await db.select().from(forestOfficersTable)
      .where(eq(forestOfficersTable.sessionToken, token)).limit(1);
    if (!officer) return res.json({ user: null });
    return res.json({ user: { id: officer.id, name: officer.name, email: officer.email, role: "officer", state: officer.state, department: officer.department, designation: officer.designation, employeeId: officer.employeeId, createdAt: officer.createdAt } });
  } else {
    const [citizen] = await db.select().from(citizensTable)
      .where(eq(citizensTable.sessionToken, token)).limit(1);
    if (!citizen) return res.json({ user: null });
    return res.json({ user: { id: citizen.id, name: citizen.name, email: citizen.email, role: "citizen", state: citizen.state, createdAt: citizen.createdAt } });
  }
});

export default router;
