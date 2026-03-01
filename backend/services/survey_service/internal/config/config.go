package config

import (
	"log"
	"os"
)

type Config struct {
	Port           string
	DatabaseURL    string
	AuthServiceURL string
}

func Load() Config {
	cfg := Config{
		Port:           getenv("PORT", "8002"),
		DatabaseURL:    os.Getenv("DATABASE_URL"),
		AuthServiceURL: getenv("AUTH_SERVICE_URL", "http://auth_service:8000"),
	}

	if cfg.DatabaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	return cfg
}

func getenv(name, fallback string) string {
	v := os.Getenv(name)
	if v == "" {
		return fallback
	}
	return v
}
