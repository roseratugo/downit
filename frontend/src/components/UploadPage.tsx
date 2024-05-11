import React, { useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../App.css'; // Assurez-vous que le chemin est correct

const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shortLink, setShortLink] = useState('');

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files ? event.target.files[0] : null);
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setFile(event.dataTransfer.files[0]);
      toast.success("Fichier prêt à être uploadé!");
      event.dataTransfer.clearData();
    }
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const onFileUpload = () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      fetch("http://localhost:8080/upload", {
        method: "POST",
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          if (data.link) {
            const completeLink = `http://localhost:5173/d/${data.link}`;
            setShortLink(completeLink);
            toast.success(`Fichier uploadé avec succès! Shortlink: ${completeLink}`);
          }
        })
        .catch(error => {
          toast.error('Erreur lors de l\'upload: ' + error.message);
        });
    } else {
      toast.warn('Veuillez sélectionner un fichier à uploader.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortLink)
      .then(() => toast.success('Lien copié dans le presse-papiers!'))
      .catch(err => toast.error('Erreur lors de la copie: ' + err));
  };

  const triggerFileSelectPopup = () => fileInputRef.current?.click();

  return (
    <div className="container"
         onDrop={onDrop}
         onDragOver={onDragOver}
         onDragLeave={onDragLeave}
         style={{ borderColor: isDragOver ? '#000' : '#ccc' }}>
      <ToastContainer />
      <h1 className="title">Upload de fichier</h1>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        className="file-input"
        style={{ display: 'none' }}
      />
      <label className="file-label" onClick={triggerFileSelectPopup}>
        Choose File
      </label>
      {file && <p>Fichier sélectionné : {file.name}</p>}
      {shortLink && (
        <div>
          <input type="text" value={shortLink} readOnly className="shortlink-input" />
          <button onClick={copyToClipboard} className="copy-button">Copy</button>
        </div>
      )}
      <button onClick={onFileUpload} className="button">
        Upload File
      </button>
    </div>
  );
};

export default UploadPage;