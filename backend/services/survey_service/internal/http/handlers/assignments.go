package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"survey_service/internal/http/middleware"
	"survey_service/internal/store"
)

type AssignmentHandler struct {
	Store *store.Store
}

func (h *AssignmentHandler) ListMyAssignments(w http.ResponseWriter, r *http.Request) {
	user, ok := middleware.CurrentUser(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	userID, err := uuid.Parse(user.ID)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "invalid user id")
		return
	}

	items, err := h.Store.ListAssignmentsByUser(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, items)
}

type submitAnswer struct {
	QuestionID string `json:"question_id"`
	Answer     any    `json:"answer"`
}

type submitAssignmentRequest struct {
	Answers []submitAnswer `json:"answers"`
}

func (h *AssignmentHandler) SubmitAssignment(w http.ResponseWriter, r *http.Request) {
	user, ok := middleware.CurrentUser(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	userID, err := uuid.Parse(user.ID)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "invalid user id")
		return
	}

	assignmentID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid assignment id")
		return
	}

	var req submitAssignmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if len(req.Answers) == 0 {
		writeError(w, http.StatusBadRequest, "answers are required")
		return
	}

	payload := make([]store.AnswerInput, 0, len(req.Answers))
	for _, ans := range req.Answers {
		qid, err := uuid.Parse(ans.QuestionID)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid question_id")
			return
		}
		raw, err := json.Marshal(ans.Answer)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid answer payload")
			return
		}
		payload = append(payload, store.AnswerInput{QuestionID: qid, Answer: raw})
	}

	if err := h.Store.SubmitAssignment(r.Context(), userID, assignmentID, payload); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]bool{"success": true})
}
