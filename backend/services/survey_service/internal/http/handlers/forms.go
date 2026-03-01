package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"survey_service/internal/authclient"
	"survey_service/internal/http/middleware"
	"survey_service/internal/store"
)

type FormHandler struct {
	Store      *store.Store
	AuthClient *authclient.Client
}

type createFormRequest struct {
	Title       string     `json:"title"`
	Description string     `json:"description"`
	DueAt       *time.Time `json:"due_at"`
}

func (h *FormHandler) ListForms(w http.ResponseWriter, r *http.Request) {
	status := strings.TrimSpace(r.URL.Query().Get("status"))
	if status != "" && status != "draft" && status != "published" && status != "archived" {
		writeError(w, http.StatusBadRequest, "status must be draft|published|archived")
		return
	}

	limit := 50
	offset := 0
	if v := r.URL.Query().Get("limit"); v != "" {
		n, err := strconv.Atoi(v)
		if err == nil && n > 0 && n <= 200 {
			limit = n
		}
	}
	if v := r.URL.Query().Get("offset"); v != "" {
		n, err := strconv.Atoi(v)
		if err == nil && n >= 0 {
			offset = n
		}
	}

	items, err := h.Store.ListForms(r.Context(), status, limit, offset)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (h *FormHandler) GetForm(w http.ResponseWriter, r *http.Request) {
	formID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid form id")
		return
	}

	formDetails, err := h.Store.GetFormWithQuestions(r.Context(), formID)
	if err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, formDetails)
}

func (h *FormHandler) CreateForm(w http.ResponseWriter, r *http.Request) {
	user, ok := middleware.CurrentUser(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req createFormRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}

	req.Title = strings.TrimSpace(req.Title)
	if req.Title == "" {
		writeError(w, http.StatusBadRequest, "title is required")
		return
	}

	creatorID, err := uuid.Parse(user.ID)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "invalid user id")
		return
	}

	form, err := h.Store.CreateForm(r.Context(), store.CreateFormInput{
		Title:       req.Title,
		Description: strings.TrimSpace(req.Description),
		DueAt:       req.DueAt,
		CreatedBy:   creatorID,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, form)
}

type addQuestionRequest struct {
	Type     string         `json:"type"`
	Title    string         `json:"title"`
	Required bool           `json:"required"`
	Position int            `json:"position"`
	Config   map[string]any `json:"config"`
}

func (h *FormHandler) AddQuestion(w http.ResponseWriter, r *http.Request) {
	formID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid form id")
		return
	}

	var req addQuestionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}

	req.Type = strings.TrimSpace(strings.ToLower(req.Type))
	req.Title = strings.TrimSpace(req.Title)
	if req.Type == "" || req.Title == "" {
		writeError(w, http.StatusBadRequest, "type and title are required")
		return
	}
	if req.Position <= 0 {
		writeError(w, http.StatusBadRequest, "position must be > 0")
		return
	}

	normalizedConfig, err := validateQuestionConfig(req.Type, req.Config)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	cfgRaw, err := json.Marshal(normalizedConfig)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid config")
		return
	}

	q, err := h.Store.CreateQuestion(r.Context(), store.CreateQuestionInput{
		FormID:       formID,
		QuestionType: req.Type,
		Title:        req.Title,
		Required:     req.Required,
		Position:     req.Position,
		Config:       cfgRaw,
	})
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, q)
}

type publishFormRequest struct {
	UserIDs []string   `json:"user_ids"`
	DueAt   *time.Time `json:"due_at"`
}

func (h *FormHandler) PublishForm(w http.ResponseWriter, r *http.Request) {
	formID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid form id")
		return
	}

	var req publishFormRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}

	userIDs := make([]uuid.UUID, 0)
	for _, raw := range req.UserIDs {
		id, err := uuid.Parse(raw)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid user id in user_ids")
			return
		}
		userIDs = append(userIDs, id)
	}

	if len(userIDs) == 0 {
		authz := r.Header.Get("Authorization")
		users, err := h.AuthClient.ListUsers(r.Context(), authz)
		if err != nil {
			writeError(w, http.StatusBadGateway, err.Error())
			return
		}

		for _, u := range users {
			if !u.IsActive {
				continue
			}
			id, err := uuid.Parse(u.ID)
			if err == nil {
				userIDs = append(userIDs, id)
			}
		}
	}

	created, err := h.Store.PublishForm(r.Context(), formID, req.DueAt, userIDs)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"form_id":             formID,
		"assigned_user_count": len(created),
	})
}

func validateQuestionConfig(qType string, config map[string]any) (map[string]any, error) {
	if config == nil {
		config = map[string]any{}
	}

	switch qType {
	case "text":
		return map[string]any{}, nil
	case "single", "multi":
		raw, ok := config["options"]
		if !ok {
			return nil, errors.New("options are required for single/multi questions")
		}
		optionsRaw, ok := raw.([]any)
		if !ok || len(optionsRaw) == 0 {
			return nil, errors.New("options must be a non-empty array")
		}
		options := make([]string, 0, len(optionsRaw))
		seen := map[string]struct{}{}
		for _, opt := range optionsRaw {
			s, ok := opt.(string)
			if !ok {
				return nil, errors.New("each option must be string")
			}
			s = strings.TrimSpace(s)
			if s == "" {
				return nil, errors.New("option cannot be empty")
			}
			if _, exists := seen[s]; exists {
				return nil, errors.New("options must be unique")
			}
			seen[s] = struct{}{}
			options = append(options, s)
		}
		return map[string]any{"options": options}, nil
	case "rating":
		min, max, err := parseRatingConfig(config)
		if err != nil {
			return nil, err
		}
		return map[string]any{"min": min, "max": max}, nil
	default:
		return nil, errors.New("type must be one of: single,multi,text,rating")
	}
}

func parseRatingConfig(config map[string]any) (int, int, error) {
	min := 1
	max := 5
	if v, ok := config["min"]; ok {
		parsed, ok := numberToInt(v)
		if !ok {
			return 0, 0, errors.New("rating min must be integer")
		}
		min = parsed
	}
	if v, ok := config["max"]; ok {
		parsed, ok := numberToInt(v)
		if !ok {
			return 0, 0, errors.New("rating max must be integer")
		}
		max = parsed
	}
	if min >= max {
		return 0, 0, errors.New("rating min must be less than max")
	}
	return min, max, nil
}

func numberToInt(v any) (int, bool) {
	switch n := v.(type) {
	case float64:
		return int(n), float64(int(n)) == n
	case int:
		return n, true
	default:
		return 0, false
	}
}
