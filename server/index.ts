import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { log } from "./utils/logger";
import { config, isDev } from "./config";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}));
app.use(compression());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson: any, ...args: any[]) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      const logData = {
        method: req.method,
        path,
        status: res.statusCode,
        duration,
        response: capturedJsonResponse
      };
      log.http(`API Request`, logData);
    }
  });

  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

    // Global error handler
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      const status = (err as any).status || (err as any).statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      log.error("Server error:", { error: err, stack: err.stack });
      
      res.status(status).json({ 
        message,
        ...(isDev ? { stack: err.stack } : {})
      });
    });

    if (isDev) {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    server.listen({
      port: config.PORT,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log.info(`Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
    });
  } catch (error) {
    log.error("Failed to start server:", error);
    process.exit(1);
  }
})();
