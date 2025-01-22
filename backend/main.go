package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

type ImageMetadata struct {
	ID        string    `json:"id"`
	Filename  string    `json:"filename"`
	Size      int64     `json:"size"`
	CreatedAt time.Time `json:"createdAt"`
	URL       string    `json:"url"`
}

var (
	uploadPath = "/home/synthetix/images"
	allowedTypes = map[string]bool{
		"image/jpeg": true,
		"image/png":  true,
		"image/gif":  true,
		"image/webp": true,
	}
)

func main() {
	// Create upload directory if it doesn't exist
	if err := os.MkdirAll(uploadPath, 0755); err != nil {
		log.Fatal(err)
	}

	r := mux.NewRouter()

	// Routes
	r.HandleFunc("/api/images", listImagesHandler).Methods("GET")
	r.HandleFunc("/api/upload", uploadHandler).Methods("POST")
	r.HandleFunc("/api/images/{id}", deleteImageHandler).Methods("DELETE")

	// CORS
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000", "https://images.ashank.tech"},
		AllowedMethods: []string{"GET", "POST", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	})

	// Basic middleware
	handler := c.Handler(r)
	handler = loggingMiddleware(handler)
	handler = rateLimitMiddleware(handler)

	// Start server
	fmt.Println("Server starting on :4001...")
	if err := http.ListenAndServe(":4001", handler); err != nil {
		log.Fatal(err)
	}
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf(
			"%s %s %s",
			r.Method,
			r.RequestURI,
			time.Since(start),
		)
	})
}

func rateLimitMiddleware(next http.Handler) http.Handler {
	// Simple rate limiting using a map
	var requests = make(map[string][]time.Time)
	const requestsPerMinute = 60

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.RemoteAddr

		now := time.Now()
		times := requests[ip]

		// Remove old requests
		var valid []time.Time
		for _, t := range times {
			if now.Sub(t) < time.Minute {
				valid = append(valid, t)
			}
		}

		if len(valid) >= requestsPerMinute {
			http.Error(w, "Too many requests", http.StatusTooManyRequests)
			return
		}

		requests[ip] = append(valid, now)
		next.ServeHTTP(w, r)
	})
}

func listImagesHandler(w http.ResponseWriter, r *http.Request) {
	files, err := os.ReadDir(uploadPath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var images []ImageMetadata
	for _, file := range files {
		if !file.IsDir() {
			info, err := file.Info()
			if err != nil {
				continue
			}

			images = append(images, ImageMetadata{
				ID:        strings.TrimSuffix(file.Name(), filepath.Ext(file.Name())),
				Filename:  file.Name(),
				Size:     info.Size(),
				CreatedAt: info.ModTime(),
				URL:      fmt.Sprintf("/images/%s", file.Name()),
			})
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(images)
}

func uploadHandler(w http.ResponseWriter, r *http.Request) {
	// 32MB max size
	r.ParseMultipartForm(32 << 20)
	
	file, header, err := r.FormFile("image")
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Check file type
	buff := make([]byte, 512)
	_, err = file.Read(buff)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	filetype := http.DetectContentType(buff)
	if !allowedTypes[filetype] {
		http.Error(w, "File type not allowed", http.StatusBadRequest)
		return
	}

	// Reset file pointer
	file.Seek(0, 0)

	// Create unique filename
	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), header.Filename)
	filepath := filepath.Join(uploadPath, filename)

	// Create new file
	dst, err := os.Create(filepath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	// Copy file
	if _, err = io.Copy(dst, file); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get file info
	fileInfo, err := os.Stat(filepath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return metadata
	metadata := ImageMetadata{
		ID:        strings.TrimSuffix(filename, filepath.Ext(filename)),
		Filename:  filename,
		Size:      fileInfo.Size(),
		CreatedAt: fileInfo.ModTime(),
		URL:       fmt.Sprintf("/images/%s", filename),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(metadata)
}

func deleteImageHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	// List files to find the one with matching ID
	files, err := os.ReadDir(uploadPath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	for _, file := range files {
		if strings.HasPrefix(file.Name(), id) {
			err := os.Remove(filepath.Join(uploadPath, file.Name()))
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			w.WriteHeader(http.StatusOK)
			return
		}
	}

	http.Error(w, "Image not found", http.StatusNotFound)
}