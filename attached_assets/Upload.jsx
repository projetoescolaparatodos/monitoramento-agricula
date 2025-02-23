import React, { useState } from "react";

const Upload = ({ onUpload }) => {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "tratores_preset"); // Substitua pelo seu upload preset
    formData.append("cloud_name", "di3lqsxxc"); // Substitua pelo seu cloud name

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/di3lqsxxc/image/upload`, // Substitua pelo seu cloud name
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      onUpload(data.secure_url); // Passa a URL da mídia para o componente pai
      alert("Upload realizado com sucesso!");
    } catch (error) {
      console.error("Erro no upload:", error);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button type="button" onClick={handleUpload}>Enviar</button>
    </div>
  );
};

export default Upload;