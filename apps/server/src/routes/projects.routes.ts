import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { validate, validateParams } from "../middlewares/validate.js";
import {
    createProjectSchema,
    projectIdParamSchema,
    projectSlugParamSchema,
    updateProjectSchema,
} from "../validators/project.schema.js";
import * as projectsController from "../controllers/projects.controller.js";

export const projectsRouter = Router();

// Every project route needs a signed-in user.
projectsRouter.use(requireAuth);

projectsRouter.post("/", validate(createProjectSchema), projectsController.create);
projectsRouter.get("/", projectsController.list);

// Registered before "/:id" so "by-slug" isn't mistaken for an id.
projectsRouter.get("/by-slug/:slug", validateParams(projectSlugParamSchema), projectsController.getBySlug);

projectsRouter.get("/:id", validateParams(projectIdParamSchema), projectsController.getById);
projectsRouter.patch("/:id", validateParams(projectIdParamSchema), validate(updateProjectSchema), projectsController.update);
projectsRouter.delete("/:id", validateParams(projectIdParamSchema), projectsController.remove);
