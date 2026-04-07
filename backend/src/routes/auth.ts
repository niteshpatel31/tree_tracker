import { Router } from "express";
import { db } from "../db";
import { citizensTable, forestOfficersTable } from "../db";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import nodemailer from "nodemailer";

const router = Router();

// Set up Ethereal mailer
let mailTransporter: nodemailer.Transporter | null = null;
async function setupMailer() {
  try {
    const account = await nodemailer.createTestAccount();
    mailTransporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: { user: account.user, pass: account.pass }
    });
    console.log("Ethereal Mailer ready for testing.");
  } catch (e) {
    console.error("Failed to setup Ethereal mailer:", e);
  }
}
setupMailer();

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
router.post("/auth/citizen/signup", async (req, res): Promise<void> => {
  const { name, email, password, state } = req.body as Record<string, string>;
  if (!name?.trim() || !email?.trim() || !password || !state) {
    res.status(400).json({ error: "All fields are required." });
    return;
  }

  const existing = await db.select({ id: citizensTable.id }).from(citizensTable)
    .where(eq(citizensTable.email, email.toLowerCase().trim())).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "An account with this email already exists." });
    return;
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
router.post("/auth/citizen/login", async (req, res): Promise<void> => {
  const { email, password } = req.body as Record<string, string>;
  if (!email?.trim() || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  const [citizen] = await db.select().from(citizensTable)
    .where(eq(citizensTable.email, email.toLowerCase().trim())).limit(1);

  if (!citizen || citizen.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
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
router.post("/auth/officer/signup", async (req, res): Promise<void> => {
  const { name, email, password, state, employeeId, department, designation } = req.body as Record<string, string>;
  if (!name?.trim() || !email?.trim() || !password || !state || !employeeId?.trim() || !department || !designation) {
    res.status(400).json({ error: "All fields are required." });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Officers require a minimum 8-character password." });
    return;
  }

  const existingEmail = await db.select({ id: forestOfficersTable.id }).from(forestOfficersTable)
    .where(eq(forestOfficersTable.email, email.toLowerCase().trim())).limit(1);
  if (existingEmail.length > 0) {
    res.status(409).json({ error: "An account with this email already exists." });
    return;
  }

  const existingEmpId = await db.select({ id: forestOfficersTable.id }).from(forestOfficersTable)
    .where(eq(forestOfficersTable.employeeId, employeeId.trim().toUpperCase())).limit(1);
  if (existingEmpId.length > 0) {
    res.status(409).json({ error: "This Employee ID is already registered." });
    return;
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

  // Send OTP via Ethereal Mail
  if (mailTransporter) {
    const info = await mailTransporter.sendMail({
      from: '"TreeTrack Verification" <no-reply@treetrack.gov.in>',
      to: officer.email,
      subject: "Your Officer Verification OTP",
      text: `Hello ${officer.name},\n\nYour Employee ID (${officer.employeeId}) requires verification.\nYour OTP for Forest Officer verification is: ${otp}\n\nPlease enter this to activate your account.`
    });
    console.log("OTP Email Sent! Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } else {
    console.log(`Fallback (Mailer absent) - OTP for ${officer.email} is: ${otp}`);
  }

  res.status(201).json({ officerId: officer.id, devOtp: otp, message: "Ethereal Mail used. Check terminal, or use devOtp." });
});

// POST /api/auth/officer/verify
router.post("/auth/officer/verify", async (req, res): Promise<void> => {
  const { officerId, otp } = req.body as { officerId: number; otp: string };
  if (!officerId || !otp) {
    res.status(400).json({ error: "Officer ID and OTP are required." });
    return;
  }

  const [officer] = await db.select().from(forestOfficersTable)
    .where(eq(forestOfficersTable.id, officerId)).limit(1);

  if (!officer) {
    res.status(404).json({ error: "Officer account not found." });
    return;
  }
  if (officer.verificationStatus === "verified") {
    res.status(400).json({ error: "Account already verified." });
    return;
  }
  if (officer.verificationOtp !== otp.trim()) {
    res.status(401).json({ error: "Invalid OTP. Please try again." });
    return;
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
router.post("/auth/officer/login", async (req, res): Promise<void> => {
  const { email, password } = req.body as Record<string, string>;
  if (!email?.trim() || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  const [officer] = await db.select().from(forestOfficersTable)
    .where(eq(forestOfficersTable.email, email.toLowerCase().trim())).limit(1);

  if (!officer || officer.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }
  if (officer.verificationStatus !== "verified") {
    res.status(403).json({ error: "Account not verified. Please complete OTP verification first.", officerId: officer.id });
    return;
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
router.post("/auth/logout", async (req, res): Promise<void> => {
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
router.get("/auth/me", async (req, res): Promise<void> => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const userType = req.headers["x-user-type"] as string;

  if (!token) {
    res.json({ user: null });
    return;
  }

  if (userType === "officer") {
    const [officer] = await db.select().from(forestOfficersTable)
      .where(eq(forestOfficersTable.sessionToken, token)).limit(1);
    if (!officer) {
      res.json({ user: null });
      return;
    }
    res.json({ user: { id: officer.id, name: officer.name, email: officer.email, role: "officer", state: officer.state, department: officer.department, designation: officer.designation, employeeId: officer.employeeId, createdAt: officer.createdAt } });
  } else {
    const [citizen] = await db.select().from(citizensTable)
      .where(eq(citizensTable.sessionToken, token)).limit(1);
    if (!citizen) {
      res.json({ user: null });
      return;
    }
    res.json({ user: { id: citizen.id, name: citizen.name, email: citizen.email, role: "citizen", state: citizen.state, createdAt: citizen.createdAt } });
  }
});

export default router;
