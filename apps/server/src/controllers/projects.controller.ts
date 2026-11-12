import type { Request, Response } from "express";
import * as projectsService from "../services/projects.service.js";

// requireAuth runs before every project route, so req.user is always set here.
function ownerId(req: Request): string {
    return req.user!.id;
}

export async function create(req: Request, res: Response) {
    const project = await projectsService.createProject(ownerId(req), req.body);
    res.status(201).json({ data: project });
}

export async function list(req: Request, res: Response) {
    const projects = await projectsService.listProjects(ownerId(req));
    res.status(200).json({ data: projects });
}

export async function getById(req: Request<{ id: string }>, res: Response) {
    const project = await projectsService.getProjectById(ownerId(req), req.params.id);
    res.status(200).json({ data: project });
}

export async function listEnvironments(req: Request<{ id: string }>, res: Response) {
    const environments = await projectsService.listProjectEnvironments(ownerId(req), req.params.id);
    res.status(200).json({ data: environments });
}

export async function getBySlug(req: Request<{ slug: string }>, res: Response) {
    const project = await projectsService.getProjectBySlug(ownerId(req), req.params.slug);
    res.status(200).json({ data: project });
}

export async function update(req: Request<{ id: string }>, res: Response) {
    const project = await projectsService.updateProject(ownerId(req), req.params.id, req.body);
    res.status(200).json({ data: project });
}

export async function remove(req: Request<{ id: string }>, res: Response) {
    await projectsService.deleteProject(ownerId(req), req.params.id);
    res.status(204).end();
}
