const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../../models/pg/User');
const Tenant = require('../../models/pg/Tenant');
const Membership = require('../../models/pg/Membership');
const redis = require('../../config/redis');

// ─── HELPERS ────────────────────────────────────────────────────────────────

const generateSlug = (name) =>
  name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// ─── REGISTER ───────────────────────────────────────────────────────────────
// Creates: user + tenant + membership (as admin) in one flow

const register = async ({ name, email, password, orgName }) => {
  // 1. Check if email already exists
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new Error('Email already registered');

  // 2. Hash the password — never store plain text
  //    bcrypt salt rounds = 10 (higher = slower = more secure, 10 is industry standard)
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Create the user
  const user = await User.create({ name, email, password: hashedPassword });

  // 4. Create the tenant (organization)
  const slug = generateSlug(orgName);
  const tenant = await Tenant.create({ name: orgName, slug: `${slug}-${uuidv4().slice(0, 6)}` });

  // 5. Assign this user as admin of the new tenant
  await Membership.create({ tenantId: tenant.id, userId: user.id, role: 'admin' });

  // 6. Sign and return a JWT
  const token = signToken({ userId: user.id, tenantId: tenant.id, role: 'admin' });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
    tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
  };
};

// ─── LOGIN ───────────────────────────────────────────────────────────────────

const login = async ({ email, password }) => {
  // 1. Find user by email
  const user = await User.findOne({ where: { email, isActive: true } });
  if (!user) throw new Error('Invalid credentials'); // vague on purpose — don't reveal if email exists

  // 2. Compare password with stored hash
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  // 3. Get their tenant membership
  const membership = await Membership.findOne({ where: { userId: user.id } });
  if (!membership) throw new Error('No tenant found for this user');

  // 4. Sign JWT with tenantId + role baked in
  const token = signToken({
    userId: user.id,
    tenantId: membership.tenantId,
    role: membership.role,
  });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
    role: membership.role,
  };
};

// ─── LOGOUT ──────────────────────────────────────────────────────────────────
// Blacklist the token in Redis so it can't be reused even before expiry

const logout = async (token) => {
  // Decode without verifying to get expiry time
  const decoded = jwt.decode(token);
  if (!decoded) return;

  // Calculate remaining TTL in seconds
  const ttl = decoded.exp - Math.floor(Date.now() / 1000);
  if (ttl > 0) {
    // Store in Redis: key = "blacklist:<token>", value = "1", expires after TTL
    await redis.set(`blacklist:${token}`, '1', 'EX', ttl);
  }
};

module.exports = { register, login, logout };