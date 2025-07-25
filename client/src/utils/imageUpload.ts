
/**
 * Utilitários para otimização e upload de imagens
 */

export const optimizeImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 800;
        let { width, height } = img;

        // Calcular novas dimensões mantendo proporção
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = (width * MAX_HEIGHT) / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Falha ao criar contexto do canvas'));
          return;
        }

        // Aplicar suavização para melhor qualidade
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Falha ao otimizar imagem'));
            return;
          }
          
          const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
            type: 'image/webp',
            lastModified: Date.now()
          });
          
          resolve(optimizedFile);
        }, 'image/webp', 0.8); // Qualidade 80% para WebP
      };
      
      img.onerror = () => {
        reject(new Error('Falha ao carregar imagem'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Falha ao ler arquivo'));
    };
    
    reader.readAsDataURL(file);
  });
};

export const validateImageFile = (file: File): boolean => {
  // Validar tipo de arquivo
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Tipo de arquivo não suportado. Use JPEG, PNG, WebP ou GIF.');
  }

  // Validar tamanho (máximo 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. Máximo 10MB permitido.');
  }

  return true;
};

export const uploadToFirebase = async (file: File): Promise<string> => {
  try {
    validateImageFile(file);
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Falha no upload');
    }

    const data = await response.json();
    return data.url || data.secure_url;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const insertImageIntoQuill = (
  quillRef: React.RefObject<any>, 
  imageUrl: string
): void => {
  const editor = quillRef.current?.getEditor();
  const range = editor?.getSelection();
  
  if (editor && range) {
    editor.insertEmbed(range.index, 'image', imageUrl);
    editor.setSelection(range.index + 1);
  }
};
