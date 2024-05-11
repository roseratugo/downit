package main

import (
    "encoding/json"
    "fmt"
    "github.com/google/uuid"
    "io/ioutil"
    "net/http"
    "os"
    "path/filepath"
)

var fileStore = make(map[string]string)

func main() {
    http.HandleFunc("/upload", uploadFileHandler) // Route d'upload
    http.HandleFunc("/d/", downloadFileHandler)   // Route de téléchargement
    err := http.ListenAndServe(":8080", nil)
    if err != nil {
        return
    }
}

func setupCORS(w *http.ResponseWriter, req *http.Request) {
    (*w).Header().Set("Access-Control-Allow-Origin", "*")
    (*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
    (*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}

func uploadFileHandler(w http.ResponseWriter, r *http.Request) {
    setupCORS(&w, r)
    if r.Method == "OPTIONS" {
        return
    }
    err := r.ParseMultipartForm(10 << 20) // Limite à 10 MB
    if err != nil {
        http.Error(w, "Erreur lors du parsing du formulaire: "+err.Error(), http.StatusBadRequest)
        return
    }

    file, handler, err := r.FormFile("file")
    if err != nil {
        http.Error(w, "Erreur en récupérant le fichier: "+err.Error(), http.StatusBadRequest)
        return
    }
    defer file.Close()

    id := uuid.New().String()
    extension := filepath.Ext(handler.Filename)
    tempFileName := fmt.Sprintf("upload-%s%s", id, extension)
    tempFilePath := filepath.Join("uploads", tempFileName)

    tempFile, err := os.OpenFile(tempFilePath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0666)
    if err != nil {
        http.Error(w, "Erreur lors de la création du fichier temporaire: "+err.Error(), http.StatusInternalServerError)
        return
    }
    defer tempFile.Close()

    fileBytes, err := ioutil.ReadAll(file)
    if err != nil {
        http.Error(w, "Erreur lors de la lecture du fichier: "+err.Error(), http.StatusInternalServerError)
        return
    }

    _, err = tempFile.Write(fileBytes)
    if err != nil {
        http.Error(w, "Erreur lors de l'écriture du fichier: "+err.Error(), http.StatusInternalServerError)
        return
    }

    fileStore[id] = tempFilePath

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{
        "message": "Fichier uploadé avec succès",
        "link": id,
    })
}

func downloadFileHandler(w http.ResponseWriter, r *http.Request) {
    setupCORS(&w, r)
    if r.Method == "OPTIONS" {
        return
    }

    id := filepath.Base(r.URL.Path)
    filePath, ok := fileStore[id]
    if !ok {
        http.NotFound(w, r)
        return
    }

    // Définir les en-têtes pour forcer le téléchargement
    w.Header().Set("Content-Disposition", "attachment; filename="+filepath.Base(filePath))
    w.Header().Set("Content-Type", "application/octet-stream")

    http.ServeFile(w, r, filePath)
}