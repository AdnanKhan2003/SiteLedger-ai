import { Request, Response } from "express";
import Project from "../models/Project";
import asyncHandler from "../lib/asyncHandler";
import APIResponse from "../lib/APIResponse";
import APIError from "../lib/APIError";
import { clearAnalyticsCache } from "../lib/redis";

export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  let query = {};

  if (user.role === "worker") {
    query = { workers: user.id };
  }

  const projects = await Project.find(query)
    .sort({ createdAt: -1 })
    .populate("workers", "name workerRole specialty photoUrl");
  res.json(new APIResponse(200, projects, "Projects fetched successfully"));
});

export const createProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, client, location, budget, startDate, workers } = req.body;

    if (!name || name.trim().length === 0) {
      throw new APIError(400, "Project name is required");
    }
    if (!client || client.trim().length === 0) {
      throw new APIError(400, "Client name is required");
    }
    if (!location || location.trim().length === 0) {
      throw new APIError(400, "Location is required");
    }
    if (!budget || isNaN(Number(budget)) || Number(budget) <= 0) {
      throw new APIError(400, "Budget must be a positive number");
    }
    if (!startDate) {
      throw new APIError(400, "Start date is required");
    }

    if (workers && Array.isArray(workers)) {
      const mongoose = require("mongoose");
      for (const wId of workers) {
        if (!mongoose.Types.ObjectId.isValid(wId)) {
          throw new APIError(400, "Invalid worker ID provided");
        }
      }
    }

    const project = new Project(req.body);
    const saved = await project.save();
    await clearAnalyticsCache();
    res
      .status(201)
      .json(new APIResponse(201, saved, "Project created successfully"));
  },
);

export const getProjectById = asyncHandler(
  async (req: Request, res: Response) => {
    const project = await Project.findById(req.params.id).populate(
      "workers",
      "name workerRole specialty photoUrl",
    );
    if (!project) throw new APIError(404, "Project not found");
    res.json(new APIResponse(200, project));
  },
);

export const updateProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, client, location, budget, workers } = req.body;

    if (name !== undefined && name.trim().length === 0) {
      throw new APIError(400, "Project name cannot be empty");
    }
    if (client !== undefined && client.trim().length === 0) {
      throw new APIError(400, "Client name cannot be empty");
    }
    if (location !== undefined && location.trim().length === 0) {
      throw new APIError(400, "Location cannot be empty");
    }
    if (
      budget !== undefined &&
      (isNaN(Number(budget)) || Number(budget) <= 0)
    ) {
      throw new APIError(400, "Budget must be a positive number");
    }

    if (workers && Array.isArray(workers)) {
      const mongoose = require("mongoose");
      for (const wId of workers) {
        if (!mongoose.Types.ObjectId.isValid(wId)) {
          throw new APIError(400, "Invalid worker ID provided");
        }
      }
    }

    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!project) {
      throw new APIError(404, "Project not found");
    }
    await clearAnalyticsCache();
    res.json(new APIResponse(200, project, "Project updated successfully"));
  },
);

export const deleteProject = asyncHandler(
  async (req: Request, res: Response) => {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) throw new APIError(404, "Project not found");
    await clearAnalyticsCache();
    res.json(new APIResponse(200, null, "Project deleted successfully"));
  },
);
