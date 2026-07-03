import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";
import { toPublicUser } from "../lib/auth";

const router: Router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const { email, password, name, bookingSlug } = req.body;

    if (!email || !password || !name || !bookingSlug) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { bookingSlug }],
      },
    });

    if (existing) {
      res.status(409).json({ error: "Email or booking slug already in use" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 4);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        bookingSlug,
      },
    });

    const token = signToken({ userId: user.id, email: user.email });

    res.cookie("session", token, {
      httpOnly: false,
      sameSite: "lax",
    });

    res.status(201).json({
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email });

    res.cookie("session", token, {
      httpOnly: false,
      sameSite: "lax",
    });

    res.json({
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
