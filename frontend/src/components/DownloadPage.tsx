import React from 'react';
import { useParams } from 'react-router-dom';
import '../App.css'; // Importer le fichier CSS pour les styles

const DownloadPage: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>(); // Utiliser les paramètres de l'URL

  // Construire l'URL de téléchargement
  const downloadUrl = `http://localhost:8080/d/${fileId}`;

  return (
    <div className="container">
      <h1 className="title">Télécharger le fichier</h1>
      <p>Cliquez sur le lien ci-dessous pour télécharger votre fichier :</p>
      <a href={downloadUrl} download className="button">Download File</a>
    </div>
  );
};

export default DownloadPage;
