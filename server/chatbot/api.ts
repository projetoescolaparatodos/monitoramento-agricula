import { spawn } from 'child_process';
import express from 'express';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../storage';
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

const router = express.Router();

router.post('/chatbot', async (req, res) => {
  try {
    const { message, userId } = req.body;

    // Send message to Rasa
    const response = await axios.post('http://0.0.0.0:5005/webhooks/rest/webhook', {
      sender: userId,
      message: message
    });

    // Save conversation to Firebase
    await addDoc(collection(db, 'chatbot_conversations'), {
      userId,
      message,
      response: response.data,
      timestamp: new Date().toISOString()
    });

    res.json(response.data);
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Error processing message' });
  }
});

export default router;

export function setupChatbotRoutes(app: express.Express) {
    app.use('/api', router);
}