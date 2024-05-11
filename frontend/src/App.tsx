import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DownloadPage from './components/DownloadPage';  // Assurez-vous que le chemin est correct
import UploadPage from './components/UploadPage'; // Votre composant d'accueil

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/d/:fileId" element={<DownloadPage />} />
      </Routes>
    </Router>
  );
};

export default App;
