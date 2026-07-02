import { Router } from "express";
import type { AuthRequest } from "../lib/auth";
import { requireAuth, toPublicUser } from "../lib/auth";
import { prisma } from "../lib/prisma";

const router: Router = Router();

router.get("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(toPublicUser(user));
  } catch (error) {
    next(error);
  }
});

export default router;
