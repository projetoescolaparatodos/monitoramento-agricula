
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Create Express application
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuração para o ambiente serverless do Vercel
export const config = {
  api: {
    bodyParser: true,
  },
};

// Middleware para logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Middleware para capturar erros não tratados nas rotas
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  console.error('Erro na aplicação:', err);
  if (res.headersSent) {
    return next(err);
  }
  
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(status).json({
    error: true,
    message: message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Configuração mais compatível com serverless
const setupServer = async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(`Erro: ${status} - ${message}`);
    
    // Evita lançar o erro novamente, apenas envia a resposta
    res.status(status).json({ message });
  });

  // Setup Vite only in development mode
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Apenas inicia o servidor se não estivermos no Vercel
  if (process.env.NODE_ENV !== "production" || process.env.VERCEL !== "1") {
    const PORT = process.env.PORT || 5000;
    server.listen(Number(PORT), "0.0.0.0", () => {
      log(`serving on port ${PORT}`);
    });
  }

  return app;
};

// Executa a configuração para desenvolvimento local
if (process.env.NODE_ENV !== "production" || process.env.VERCEL !== "1") {
  setupServer();
}

// Handler para o Vercel serverless
export default async function handler(req: Request, res: Response) {
  const appInstance = await setupServer();
  return appInstance(req, res);
}
