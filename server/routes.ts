import type { Express } from "express";
import { createServer, type Server } from "http";
// Add necessary imports for database interaction and routing (e.g., 'express', database driver)
// import { db, contents, charts, eq } from './database'; // Example - replace with your actual imports


export async function registerRoutes(app: Express): Promise<Server> {
  // Rota de verificação de saúde da API
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
  });

  // Contents routes
  app.get('/api/contents', async (req, res) => {
    try {
      const { pageType } = req.query;
      const contents = await db.select().from(contents)
        .where(pageType ? eq(contents.pageType, pageType as string) : undefined)
        .where(eq(contents.active, true));
      res.json(contents);
    } catch (error) {
      console.error('Error fetching contents:', error);
      res.status(500).json({ error: true, message: 'Erro ao buscar conteúdos' });
    }
  });

  // Charts routes
  app.get('/api/charts', async (req, res) => {
    try {
      const { pageType } = req.query;
      const charts = await db.select().from(charts)
        .where(pageType ? eq(charts.pageType, pageType as string) : undefined)
        .where(eq(charts.active, true))
        .orderBy(charts.order);
      res.json(charts);
    } catch (error) {
      console.error('Error fetching charts:', error);
      res.status(500).json({ error: true, message: 'Erro ao buscar gráficos' });
    }
  });

  // Media items routes
  app.get('/api/media-items', async (req, res) => {
    try {
      const { pageType } = req.query;
      const mediaItems = await db.select().from(mediaItems)
        .where(pageType ? eq(mediaItems.pageType, pageType as string) : undefined)
        .where(eq(mediaItems.active, true))
        .orderBy(mediaItems.createdAt, 'desc');
      res.json(mediaItems);
    } catch (error) {
      console.error('Error fetching media items:', error);
      res.status(500).json({ error: true, message: 'Erro ao buscar itens de mídia' });
    }
  });

  // Statistics routes
  app.get('/api/statistics', async (req, res) => {
    try {
      const { pageType } = req.query;
      const statistics = await db.select().from(statistics)
        .where(pageType ? eq(statistics.pageType, pageType as string) : undefined)
        .where(eq(statistics.active, true))
        .orderBy(statistics.order);
      res.json(statistics);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ error: true, message: 'Erro ao buscar estatísticas' });
    }
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