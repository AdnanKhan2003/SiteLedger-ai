import { Request, Response } from "express";
import Attendance from "../models/Attendance";
import User from "../models/User";
import asyncHandler from "../lib/asyncHandler";
import APIResponse from "../lib/APIResponse";
import APIError from "../lib/APIError";
import { clearAnalyticsCache } from "../lib/redis";
import logger from "../lib/logger";

export const markAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    let { workerId, date, timeIn, status, notes } = req.body;

    if (user.role === "worker") {
      workerId = user.id;

      status = "pending";
    }

    if (!workerId) {
      throw new APIError(400, "Worker ID is required.");
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
      worker: workerId,
      date: attendanceDate,
    });

    if (existing) {
      if (req.body.timeOut) existing.timeOut = req.body.timeOut;

      if (user.role === "worker") {
        existing.status = "pending";
      } else if (status) {
        existing.status = status;
      }

      await existing.save();
      await clearAnalyticsCache();
      logger.info('Attendance updated', { workerId, date: attendanceDate });
      return res.json(
        new APIResponse(200, existing, "Attendance updated successfully"),
      );
    }

    const attendance = new Attendance({
      worker: workerId,
      date: attendanceDate,
      timeIn,

      status: status || "present",
      notes,
    });

    const saved = await attendance.save();
    await clearAnalyticsCache();
    logger.info('Attendance marked', { workerId, date: attendanceDate, status: status || 'present' });
    res
      .status(201)
      .json(new APIResponse(201, saved, "Attendance marked successfully"));
  },
);

export const getAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { date, workerId } = req.query;
    const query: any = {};

    if (user.role === "worker") {
      query.worker = user.id;
    } else {
      if (workerId) query.worker = workerId;
    }

    if (date) {
      const d = new Date(date as string);
      d.setHours(0, 0, 0, 0);
      query.date = d;
    }

    const list = await Attendance.find(query).populate(
      "worker",
      "name workerRole",
    );
    logger.debug('Attendance fetched', { role: user.role, count: list.length });
    res.json(new APIResponse(200, list, "Attendance fetched successfully"));
  },
);
