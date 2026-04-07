import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import asyncHandler from "../lib/asyncHandler";
import APIResponse from "../lib/APIResponse";
import APIError from "../lib/APIError";
import { clearAnalyticsCache } from "../lib/redis";
import logger from "../lib/logger";

export const registerWorker = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password, phone, specialty, workerRole, dailyRate } =
      req.body;

    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !specialty ||
      !workerRole ||
      !dailyRate
    ) {
      throw new APIError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new APIError(400, "Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: "worker",
      phone,
      workerRole,
      specialty,
      dailyRate: Number(dailyRate),
      status: "active",
    });

    await clearAnalyticsCache();
    logger.info('Worker self-registered via QR', { email, name });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" },
    );

    res.status(201).json(
      new APIResponse(
        201,
        {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            workerRole: user.workerRole,
            specialty: user.specialty,
            dailyRate: user.dailyRate,
            status: user.status,
          },
        },
        "Worker account created successfully",
      ),
    );
  },
);
