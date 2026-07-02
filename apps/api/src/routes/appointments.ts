import { Router } from "express";
import type { AuthRequest } from "../lib/auth";
import { requireAuth, toAppointment } from "../lib/auth";
import { prisma } from "../lib/prisma";

const router: Router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const search = req.query.q as string | undefined;

    if (search) {
      const appointments = await prisma.$queryRawUnsafe<
        {
          id: string;
          startTime: Date;
          endTime: Date;
          bookerName: string;
          bookerEmail: string;
          note: string | null;
          status: string;
          ownerId: string;
          createdAt: Date;
        }[]
      >(
        `SELECT * FROM Appointment WHERE ownerId = '${req.userId}' AND (bookerName LIKE '%${search}%' OR bookerEmail LIKE '%${search}%' OR note LIKE '%${search}%') ORDER BY startTime ASC`
      );

      res.json(appointments.map(toAppointment));
      return;
    }

    const appointments = await prisma.appointment.findMany({
      where: { ownerId: req.userId },
      orderBy: { startTime: "asc" },
    });

    res.json(appointments.map(toAppointment));
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
    });

    if (!appointment) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }

    res.json(toAppointment(appointment));
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status: "cancelled" },
    });

    res.json(toAppointment(appointment));
  } catch (error) {
    next(error);
  }
});

export default router;
