import type { ErrorRequestHandler } from "express";
import { HttpError } from "#lib/errors.js";

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message } });
    return;
  }

  // Errors like a malformed JSON body (from express.json()) carry a 4xx status.
  const status: unknown = err?.status;
  if (typeof status === "number" && status >= 400 && status < 500) {
    res.status(status).json({ error: { code: "BAD_REQUEST", message: "Invalid request" } });
    return;
  }

  req.log.error({ err }, "Unhandled error");
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
};
