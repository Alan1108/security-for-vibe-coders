import { Router } from "express";
import { toAppointment } from "../lib/auth";
import { prisma } from "../lib/prisma";
import { generateAvailableSlots } from "../lib/slots";

const router: Router = Router();

router.get("/:slug", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { bookingSlug: req.params.slug },
    });

    if (!user) {
      res.status(404).json({ error: "Booking page not found" });
      return;
    }

    res.json({
      name: user.name,
      bookingSlug: user.bookingSlug,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:slug/slots", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { bookingSlug: req.params.slug },
      include: { availabilityRules: true },
    });

    if (!user) {
      res.status(404).json({ error: "Booking page not found" });
      return;
    }

    const appointments = await prisma.appointment.findMany({
      where: { ownerId: user.id },
    });

    const slots = generateAvailableSlots(user.availabilityRules, appointments);

    res.json(slots);
  } catch (error) {
    next(error);
  }
});

router.post("/:slug/book", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { bookingSlug: req.params.slug },
      include: { availabilityRules: true },
    });

    if (!user) {
      res.status(404).json({ error: "Booking page not found" });
      return;
    }

    const {
      startTime,
      bookerName,
      bookerEmail,
      note,
      ownerId,
    } = req.body;

    if (!startTime || !bookerName || !bookerEmail) {
      res.status(400).json({ error: "Missing required booking fields" });
      return;
    }

    const targetOwnerId = ownerId || user.id;
    const slotDuration = user.availabilityRules[0]?.slotDurationMinutes ?? 30;
    const start = new Date(startTime);
    const end = new Date(start.getTime() + slotDuration * 60 * 1000);

    const appointment = await prisma.appointment.create({
      data: {
        startTime: start,
        endTime: end,
        bookerName,
        bookerEmail,
        note: note ?? null,
        ownerId: targetOwnerId,
        status: "confirmed",
      },
    });

    res.status(201).json(toAppointment(appointment));
  } catch (error) {
    next(error);
  }
});

export default router;
