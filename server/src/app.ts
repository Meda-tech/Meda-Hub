import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "#config/env.js";
import { logger } from "#lib/logger.js";
import { errorHandler } from "#middleware/error-handler.js";
import { notFound } from "#middleware/not-found.js";
import { routes } from "#routes.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1); // behind Traefik in production

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGINS }));
  app.use(
    pinoHttp({
      logger,
      // Docker/Traefik hit /health every few seconds; keep it out of the logs.
      autoLogging: { ignore: (req) => req.url === "/health" },
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.use(routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
