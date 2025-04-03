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
import express from 'express';
import { db } from '../firebase';

const router = express.Router();

// Endpoint para salvar respostas do chatbot
router.post('/save-response', async (req, res) => {
  try {
    const { userId, conversation, timestamp, respostas } = req.body;
    
    if (!respostas) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }
    
    await db.collection('chatbot_respostas').add({
      userId,
      conversation,
      timestamp: timestamp || new Date().toISOString(),
      respostas,
      status: 'pendente'
    });
    
    res.json({ success: true, message: 'Dados salvos com sucesso!' });
  } catch (error) {
    console.error('Erro ao salvar respostas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para obter perguntas do questionário
router.get('/questionarios/:setor', async (req, res) => {
  try {
    const { setor } = req.params;
    const doc = await db.collection('questionarios').doc(setor).get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Questionário não encontrado' });
    }
    
    res.json({ success: true, data: doc.data() });
  } catch (error) {
    console.error('Erro ao buscar questionário:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
