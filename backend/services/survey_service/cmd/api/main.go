package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"survey_service/internal/authclient"
	"survey_service/internal/config"
	"survey_service/internal/db"
	handlers "survey_service/internal/http/handlers"
	authmw "survey_service/internal/http/middleware"
	"survey_service/internal/store"
)

func main() {
	cfg := config.Load()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool, err := db.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("db connect failed: %v", err)
	}
	defer pool.Close()

	if err := db.EnsureSchema(ctx, pool); err != nil {
		log.Fatalf("ensure schema failed: %v", err)
	}

	st := store.New(pool)
	ac := authclient.New(cfg.AuthServiceURL)

	formHandler := &handlers.FormHandler{Store: st, AuthClient: ac}
	assignmentHandler := &handlers.AssignmentHandler{Store: st}
	notificationHandler := &handlers.NotificationHandler{Store: st}

	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))

	r.Get("/health", handlers.Health)

	r.Group(func(pr chi.Router) {
		pr.Use(authmw.Auth(ac))

		pr.Route("/v1", func(v1 chi.Router) {
			v1.With(authmw.RequireAdmin).Get("/forms", formHandler.ListForms)
			v1.With(authmw.RequireAdmin).Post("/forms", formHandler.CreateForm)
			v1.With(authmw.RequireAdmin).Get("/forms/{id}", formHandler.GetForm)
			v1.With(authmw.RequireAdmin).Post("/forms/{id}/questions", formHandler.AddQuestion)
			v1.With(authmw.RequireAdmin).Post("/forms/{id}/publish", formHandler.PublishForm)

			v1.Get("/my/assignments", assignmentHandler.ListMyAssignments)
			v1.Post("/assignments/{id}/submit", assignmentHandler.SubmitAssignment)

			v1.Get("/my/notifications", notificationHandler.ListMyNotifications)
			v1.Get("/my/notifications/unread-count", notificationHandler.UnreadCount)
			v1.Post("/my/notifications/{id}/read", notificationHandler.MarkRead)
		})
	})

	addr := ":" + cfg.Port
	log.Printf("survey_service listening on %s", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("http server failed: %v", err)
	}
}
