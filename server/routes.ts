import type { Express } from "express";
import { createServer, type Server } from "http";
// Add necessary imports for database interaction and routing (e.g., 'express', database driver)
// import { db, contents, charts, eq } from './database'; // Example - replace with your actual imports


export async function registerRoutes(app: Express): Promise<Server> {
  // Rota de verificação de saúde da API
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
  });

  // Add new API routes here.  Example based on provided changes:
  // app.get('/api/contents', async (req, res) => {
  //   const { pageType } = req.query;
  //   try {
  //     const contentsData = await db.select().from(contents)
  //       .where(pageType ? eq(contents.pageType, pageType as string) : undefined)
  //       .where(eq(contents.active, true));
  //     res.json(contentsData);
  //   } catch (error) {
  //     console.error('Error fetching contents:', error);
  //     res.status(500).json({ error: 'Failed to fetch contents' });
  //   }
  // });

  // app.get('/api/charts', async (req, res) => {
  //   const { pageType } = req.query;
  //   try {
  //     const chartsData = await db.select().from(charts)
  //       .where(pageType ? eq(charts.pageType, pageType as string) : undefined)
  //       .where(eq(charts.active, true))
  //       .orderBy(charts.order);
  //     res.json(chartsData);
  //   } catch (error) {
  //     console.error('Error fetching charts:', error);
  //     res.status(500).json({ error: 'Failed to fetch charts' });
  //   }
  // });


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