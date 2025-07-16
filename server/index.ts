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
  // Middleware específico para bypass de validação de host no deployment
  app.use((req: Request, res: Response, next: NextFunction) => {
    const host = req.get('host');
    if (host && host.includes('semapavtx.replit.app')) {
      // Bypass host validation for deployment
      req.headers['x-forwarded-host'] = host;
    }
    next();
  });

  // Adicionar middleware CORS e CSP antes das rotas
  app.use((req: Request, res: Response, next: NextFunction) => {
    const allowedOrigins = [
      'https://semapavtx.replit.app',
      'http://semapavtx.replit.app',
      'https://b8edcc22-d521-4d45-87db-953b6b1d5274-00-7a5a0x16fdsj.spock.replit.dev',
      'https://303548ff-1da9-44e3-82ae-34ecd1b6f479-00-knd92yva2khn.janeway.replit.dev',
      'https://70ce0eac-1b8f-41e8-b2c8-9237dbaf5480-00-25pfeu9a8onft.worf.replit.dev',
      'https://18116612-0326-4ade-87da-5c8c89c7febd-00-2keq9gd9zgq51.kirk.replit.dev'
    ];
    
    // Allow all origins for deployment host
    const host = req.get('host');
    if (host && host.includes('semapavtx.replit.app')) {
      res.header('Access-Control-Allow-Origin', '*');
    } else {
      const origin = req.headers.origin;
      if (allowedOrigins.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin || '*');
      }
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // Headers de segurança para permitir iframes do Google Drive
    res.header('X-Frame-Options', 'SAMEORIGIN');
    res.header('Content-Security-Policy', "frame-src 'self' https://drive.google.com https://*.google.com https://www.youtube.com https://*.youtube.com https://*.googleapis.com; frame-ancestors 'self'");
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('Referrer-Policy', 'strict-origin-when-cross-origin');

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Middleware para timeout das requisições
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setTimeout(30000, () => {
      console.error(`Request timeout: ${req.method} ${req.url}`);
      if (!res.headersSent) {
        res.status(408).json({ message: 'Request timeout' });
      }
    });
    next();
  });

  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(`Erro: ${status} - ${message} - URL: ${req.url}`);
    console.error('Stack trace:', err.stack);

    // Evita lançar o erro novamente, apenas envia a resposta
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
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
      log(`allowed hosts configured for semapavtx.replit.app`);
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