
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase-config";

export async function uploadToFirebaseStorage(
  buffer: Buffer, 
  originalname: string, 
  mimeType: string, 
  folder: string = "uploads"
) {
  try {
    // Extrair o tipo de arquivo (imagem, vídeo, etc.)
    const fileType = mimeType.split('/')[0]; 
    const timestamp = Date.now();
    const path = `${folder}/${fileType}/${timestamp}_${originalname}`;
    
    // Criar referência para o arquivo
    const fileRef = ref(storage, path);
    
    // Fazer upload do arquivo
    await uploadBytes(fileRef, buffer);
    
    // Obter URL de download
    const downloadUrl = await getDownloadURL(fileRef);
    
    return {
      success: true,
      url: downloadUrl,
      path: path
    };
  } catch (error) {
    console.error("Erro ao fazer upload para o Firebase Storage:", error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}
