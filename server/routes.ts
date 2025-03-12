import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Rota de verificação de saúde da API
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
  });

  // Middleware para capturar erros de rota não encontrada
  app.use('/api/*', (req, res) => {
    res.status(404).json({ 
      error: true,
      message: `Rota não encontrada: ${req.method} ${req.path}`
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
