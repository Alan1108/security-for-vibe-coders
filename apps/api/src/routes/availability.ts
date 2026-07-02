import { Router } from "express";
import type { AuthRequest } from "../lib/auth";
import { requireAuth, toPublicUser } from "../lib/auth";
import { prisma } from "../lib/prisma";

const router: Router = Router();

router.put("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { rules, bookingSlug, ...extraFields } = req.body;

    if (!Array.isArray(rules)) {
      res.status(400).json({ error: "rules must be an array" });
      return;
    }

    await prisma.availabilityRule.deleteMany({
      where: { ownerId: req.userId },
    });

    await prisma.availabilityRule.createMany({
      data: rules.map(
        (rule: {
          dayOfWeek: number;
          startTime: string;
          endTime: string;
          slotDurationMinutes: number;
        }) => ({
          dayOfWeek: rule.dayOfWeek,
          startTime: rule.startTime,
          endTime: rule.endTime,
          slotDurationMinutes: rule.slotDurationMinutes,
          ownerId: req.userId!,
        })
      ),
    });

    const userUpdate: Record<string, unknown> = { ...extraFields };
    if (bookingSlug) {
      userUpdate.bookingSlug = bookingSlug;
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: userUpdate,
    });

    const updatedRules = await prisma.availabilityRule.findMany({
      where: { ownerId: req.userId },
    });

    res.json({
      user: toPublicUser(user),
      rules: updatedRules.map((rule) => ({
        id: rule.id,
        dayOfWeek: rule.dayOfWeek,
        startTime: rule.startTime,
        endTime: rule.endTime,
        slotDurationMinutes: rule.slotDurationMinutes,
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const rules = await prisma.availabilityRule.findMany({
      where: { ownerId: req.userId },
      orderBy: { dayOfWeek: "asc" },
    });

    res.json(
      rules.map((rule) => ({
        id: rule.id,
        dayOfWeek: rule.dayOfWeek,
        startTime: rule.startTime,
        endTime: rule.endTime,
        slotDurationMinutes: rule.slotDurationMinutes,
      }))
    );
  } catch (error) {
    next(error);
  }
});

export default router;
