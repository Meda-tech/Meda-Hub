import type { RequestHandler } from "express";
import { HttpError } from "#lib/errors.js";

export const notFound: RequestHandler = (req) => {
  throw new HttpError(404, "NOT_FOUND", `Route ${req.method} ${req.path} not found`);
};
