import { Request, Response } from 'express';
import fetch from 'node-fetch';
import multer from 'multer';
import FormData from 'form-data';

// Configurar o multer para processar uploads de arquivos
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Extrair informações do CLOUDINARY_URL
const cloudinaryUrl = process.env.CLOUDINARY_URL;
let cloudName = '';
let apiKey = '';
let apiSecret = '';

if (cloudinaryUrl) {
  try {
    // cloudinary://API_KEY:API_SECRET@CLOUD_NAME
    const cloudinaryRegex = /cloudinary:\/\/([^:]+):([^@]+)@(.+)/;
    const match = cloudinaryUrl.match(cloudinaryRegex);

    if (match) {
      apiKey = match[1];
      apiSecret = match[2];
      cloudName = match[3];
      console.log("Cloudinary configurado para cloud:", cloudName);
    } else {
      console.error("Formato de CLOUDINARY_URL inválido");
    }
  } catch (err) {
    console.error("Erro ao processar CLOUDINARY_URL:", err);
  }
}

// Middleware para upload
export const handleCloudinaryUpload = upload.single('file');

// Endpoint para upload seguro no Cloudinary
export const uploadToCloudinary = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({ error: 'Configuração do Cloudinary incompleta' });
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, { filename: req.file.originalname });
    formData.append('upload_preset', 'tratores_preset');
    formData.append('api_key', apiKey);
    formData.append('timestamp', String(Date.now() / 1000));

    // Gerar assinatura para autenticação
    const crypto = require('crypto');
    const params = {
      timestamp: String(Date.now() / 1000),
      upload_preset: 'tratores_preset',
    };

    // Ordenar parâmetros e criar string para assinatura
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&') + apiSecret;

    // Gerar assinatura
    const signature = crypto.createHash('sha1').update(paramString).digest('hex');
    formData.append('signature', signature);

    // Enviar para Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro Cloudinary:', errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return res.status(500).json({ error: 'Erro interno ao processar upload' });
  }
};