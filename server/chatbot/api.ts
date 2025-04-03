
import { spawn } from 'child_process';
import type { Express } from 'express';
import { db } from '../storage';
import { collection, addDoc } from 'firebase/firestore';
import axios from 'axios';

let rasaProcess: any = null;

export function initializeRasa() {
  rasaProcess = spawn('rasa', ['run', '--enable-api', '--cors', '"*"'], {
    cwd: './server/chatbot'
  });

  rasaProcess.stdout.on('data', (data: Buffer) => {
    console.log(`Rasa: ${data}`);
  });

  rasaProcess.stderr.on('data', (data: Buffer) => {
    console.error(`Rasa Error: ${data}`);
  });
}

export function setupChatbotRoutes(app: Express) {
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, userId } = req.body;
      
      // Enviar mensagem para o Rasa
      const response = await fetch('http://0.0.0.0:5005/webhooks/rest/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: userId,
          message: message
        })
      });

      const rasaResponse = await response.json();
      
      // Salvar conversa no Firebase
      await addDoc(collection(db, 'chatbot_conversations'), {
        userId,
        message,
        response: rasaResponse,
        timestamp: new Date().toISOString()
      });

      res.json(rasaResponse);
    } catch (error) {
      console.error('Erro no chatbot:', error);
      res.status(500).json({ error: 'Erro ao processar mensagem' });
    }
  });
}
