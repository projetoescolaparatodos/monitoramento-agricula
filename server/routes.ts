import type { Express } from "express";
import { createServer, type Server } from "http";
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from './storage';
import multer from 'multer';

interface ChatbotMessage {
  nome: string;
  cpf: string;
  endereco: string;
  propriedade: string;
  atividade: string;
  servico: string;
  dataRegistro: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
  });

  // Contents routes
  app.get('/api/contents', async (req, res) => {
    try {
      const { pageType } = req.query;
      const contentsRef = collection(db, 'contents');
      const q = pageType 
        ? query(contentsRef, where('pageType', '==', pageType), where('active', '==', true))
        : query(contentsRef, where('active', '==', true));

      const querySnapshot = await getDocs(q);
      const contents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json(contents);
    } catch (error) {
      console.error('Error fetching contents:', error);
      res.status(500).json({ error: true, message: 'Erro ao buscar conteúdos' });
    }
  });

  app.post('/api/contents', async (req, res) => {
    try {
      const contentData = req.body;
      const contentsRef = collection(db, 'contents');
      const docRef = await addDoc(contentsRef, {
        ...contentData,
        createdAt: new Date().toISOString(),
        active: true
      });

      res.json({ id: docRef.id, ...contentData });
    } catch (error) {
      console.error('Error creating content:', error);
      res.status(500).json({ error: true, message: 'Erro ao criar conteúdo' });
    }
  });

  // Charts routes
  app.get('/api/charts', async (req, res) => {
    try {
      const { pageType } = req.query;
      const chartsRef = collection(db, 'charts');
      const q = pageType 
        ? query(chartsRef, where('pageType', '==', pageType), where('active', '==', true))
        : query(chartsRef, where('active', '==', true));

      const querySnapshot = await getDocs(q);
      const charts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json(charts);
    } catch (error) {
      console.error('Error fetching charts:', error);
      res.status(500).json({ error: true, message: 'Erro ao buscar gráficos' });
    }
  });

  app.post('/api/charts', async (req, res) => {
    try {
      const chartData = req.body;
      const chartsRef = collection(db, 'charts');
      const docRef = await addDoc(chartsRef, {
        ...chartData,
        createdAt: new Date().toISOString(),
        active: true
      });

      res.json({ id: docRef.id, ...chartData });
    } catch (error) {
      console.error('Error creating chart:', error);
      res.status(500).json({ error: true, message: 'Erro ao criar gráfico' });
    }
  });

  // Media items routes
  app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: true, message: 'Nenhum arquivo enviado' });
      }

      // Importação direta do módulo do Firebase
      const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
      const { storage } = require('./storage');
      
      // Criar caminho para o arquivo
      const fileType = req.file.mimetype.split('/')[0]; // 'image' ou 'video'
      const timestamp = Date.now();
      const path = `uploads/${fileType}/${timestamp}_${req.file.originalname}`;
      
      // Criar referência para o arquivo
      const fileRef = ref(storage, path);
      
      // Upload do arquivo para o Firebase Storage
      await uploadBytes(fileRef, req.file.buffer);
      
      // Obter URL de download
      const downloadUrl = await getDownloadURL(fileRef);

      res.json({ url: downloadUrl });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: true, message: 'Erro ao fazer upload do arquivo' });
    }
  });

  app.get('/api/media-items', async (req, res) => {
    try {
      const { pageType } = req.query;
      const mediaRef = collection(db, 'media');
      const q = pageType 
        ? query(mediaRef, where('pageType', '==', pageType), where('active', '==', true))
        : query(mediaRef, where('active', '==', true));

      const querySnapshot = await getDocs(q);
      const mediaItems = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json(mediaItems);
    } catch (error) {
      console.error('Error fetching media items:', error);
      res.status(500).json({ error: true, message: 'Erro ao buscar itens de mídia' });
    }
  });

  app.post('/api/media-items', async (req, res) => {
    try {
      const mediaData = req.body;
      const mediaRef = collection(db, 'media');
      const docRef = await addDoc(mediaRef, {
        ...mediaData,
        createdAt: new Date().toISOString(),
        active: true
      });

      res.json({ id: docRef.id, ...mediaData });
    } catch (error) {
      console.error('Error creating media item:', error);
      res.status(500).json({ error: true, message: 'Erro ao criar item de mídia' });
    }
  });

  // Statistics endpoints
  app.get('/api/statistics', async (req, res) => {
    try {
      const { pageType } = req.query;
      const statsRef = collection(db, 'statistics');
      const q = pageType 
        ? query(statsRef, where('pageType', '==', pageType), where('active', '==', true))
        : query(statsRef, where('active', '==', true));

      const querySnapshot = await getDocs(q);
      const statistics = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('Fetched statistics:', statistics);
      res.json(statistics);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ error: true, message: 'Erro ao buscar estatísticas' });
    }
  });

  app.post('/api/statistics', async (req, res) => {
    try {
      const statData = req.body;
      const statsRef = collection(db, 'statistics');
      const docRef = await addDoc(statsRef, {
        ...statData,
        createdAt: new Date().toISOString(),
        active: true
      });

      console.log('Created statistic:', { id: docRef.id, ...statData });
      res.json({ id: docRef.id, ...statData });
    } catch (error) {
      console.error('Error creating statistic:', error);
      res.status(500).json({ error: true, message: 'Erro ao criar estatística' });
    }
  });

  // Chatbot messages endpoint
  app.post('/api/chatbot/mensagens', async (req, res) => {
    try {
      const messageData: ChatbotMessage = req.body;
      await db.collection('chatbot_messages').add(messageData); 
      res.status(200).json({ success: true, message: 'Dados salvos com sucesso' });
    } catch (error) {
      console.error('Erro ao salvar dados do chatbot:', error);
      res.status(500).json({ success: false, error: 'Erro ao processar solicitação' });
    }
  });

  // Configurar multer para processar uploads
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });


  const httpServer = createServer(app);
  return httpServer;
}