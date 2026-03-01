package store

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Store struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Store {
	return &Store{pool: pool}
}

type Form struct {
	ID          uuid.UUID  `json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Status      string     `json:"status"`
	CreatedBy   uuid.UUID  `json:"created_by"`
	DueAt       *time.Time `json:"due_at,omitempty"`
	PublishedAt *time.Time `json:"published_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
}

type Question struct {
	ID           uuid.UUID       `json:"id"`
	FormID       uuid.UUID       `json:"form_id"`
	QuestionType string          `json:"question_type"`
	Title        string          `json:"title"`
	Required     bool            `json:"required"`
	Position     int             `json:"position"`
	Config       json.RawMessage `json:"config"`
	CreatedAt    time.Time       `json:"created_at"`
}

type Assignment struct {
	ID          uuid.UUID  `json:"id"`
	FormID      uuid.UUID  `json:"form_id"`
	FormTitle   string     `json:"form_title"`
	Status      string     `json:"status"`
	DueAt       *time.Time `json:"due_at,omitempty"`
	AssignedAt  time.Time  `json:"assigned_at"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
}

type Notification struct {
	ID        uuid.UUID       `json:"id"`
	Type      string          `json:"type"`
	Title     string          `json:"title"`
	Payload   json.RawMessage `json:"payload"`
	IsRead    bool            `json:"is_read"`
	CreatedAt time.Time       `json:"created_at"`
	ReadAt    *time.Time      `json:"read_at,omitempty"`
}

type FormDetails struct {
	Form      Form       `json:"form"`
	Questions []Question `json:"questions"`
}

type CreateFormInput struct {
	Title       string
	Description string
	DueAt       *time.Time
	CreatedBy   uuid.UUID
}

func (s *Store) CreateForm(ctx context.Context, in CreateFormInput) (*Form, error) {
	id := uuid.New()
	row := s.pool.QueryRow(
		ctx,
		`INSERT INTO survey_forms (id, title, description, status, created_by, due_at)
		 VALUES ($1, $2, $3, 'draft', $4, $5)
		 RETURNING id, title, description, status, created_by, due_at, published_at, created_at`,
		id, in.Title, in.Description, in.CreatedBy, in.DueAt,
	)

	var f Form
	if err := row.Scan(&f.ID, &f.Title, &f.Description, &f.Status, &f.CreatedBy, &f.DueAt, &f.PublishedAt, &f.CreatedAt); err != nil {
		return nil, err
	}
	return &f, nil
}

func (s *Store) ListForms(ctx context.Context, status string, limit, offset int) ([]Form, error) {
	if limit <= 0 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	var (
		rows pgx.Rows
		err  error
	)
	if status != "" {
		rows, err = s.pool.Query(
			ctx,
			`SELECT id, title, description, status, created_by, due_at, published_at, created_at
			 FROM survey_forms
			 WHERE status = $1
			 ORDER BY created_at DESC
			 LIMIT $2 OFFSET $3`,
			status, limit, offset,
		)
	} else {
		rows, err = s.pool.Query(
			ctx,
			`SELECT id, title, description, status, created_by, due_at, published_at, created_at
			 FROM survey_forms
			 ORDER BY created_at DESC
			 LIMIT $1 OFFSET $2`,
			limit, offset,
		)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]Form, 0)
	for rows.Next() {
		var f Form
		if err := rows.Scan(&f.ID, &f.Title, &f.Description, &f.Status, &f.CreatedBy, &f.DueAt, &f.PublishedAt, &f.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, f)
	}
	return items, rows.Err()
}

func (s *Store) GetFormWithQuestions(ctx context.Context, formID uuid.UUID) (*FormDetails, error) {
	var f Form
	if err := s.pool.QueryRow(
		ctx,
		`SELECT id, title, description, status, created_by, due_at, published_at, created_at
		 FROM survey_forms
		 WHERE id = $1`,
		formID,
	).Scan(&f.ID, &f.Title, &f.Description, &f.Status, &f.CreatedBy, &f.DueAt, &f.PublishedAt, &f.CreatedAt); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("form not found")
		}
		return nil, err
	}

	rows, err := s.pool.Query(
		ctx,
		`SELECT id, form_id, question_type, title, required, position, config, created_at
		 FROM survey_questions
		 WHERE form_id = $1
		 ORDER BY position ASC`,
		formID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	questions := make([]Question, 0)
	for rows.Next() {
		var q Question
		if err := rows.Scan(&q.ID, &q.FormID, &q.QuestionType, &q.Title, &q.Required, &q.Position, &q.Config, &q.CreatedAt); err != nil {
			return nil, err
		}
		questions = append(questions, q)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return &FormDetails{Form: f, Questions: questions}, nil
}

type CreateQuestionInput struct {
	FormID       uuid.UUID
	QuestionType string
	Title        string
	Required     bool
	Position     int
	Config       json.RawMessage
}

func (s *Store) CreateQuestion(ctx context.Context, in CreateQuestionInput) (*Question, error) {
	id := uuid.New()
	row := s.pool.QueryRow(
		ctx,
		`INSERT INTO survey_questions (id, form_id, question_type, title, required, position, config)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 RETURNING id, form_id, question_type, title, required, position, config, created_at`,
		id, in.FormID, in.QuestionType, in.Title, in.Required, in.Position, in.Config,
	)

	var q Question
	if err := row.Scan(&q.ID, &q.FormID, &q.QuestionType, &q.Title, &q.Required, &q.Position, &q.Config, &q.CreatedAt); err != nil {
		return nil, err
	}
	return &q, nil
}

type PublishedAssignment struct {
	AssignmentID uuid.UUID
	UserID       uuid.UUID
	FormID       uuid.UUID
	FormTitle    string
}

func (s *Store) PublishForm(ctx context.Context, formID uuid.UUID, dueAt *time.Time, userIDs []uuid.UUID) ([]PublishedAssignment, error) {
	if len(userIDs) == 0 {
		return nil, errors.New("no users for assignment")
	}

	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	var formTitle string
	if err := tx.QueryRow(
		ctx,
		`UPDATE survey_forms
		 SET status = 'published', published_at = COALESCE(published_at, now()), due_at = COALESCE($2, due_at), updated_at = now()
		 WHERE id = $1
		 RETURNING title`,
		formID, dueAt,
	).Scan(&formTitle); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("form not found")
		}
		return nil, err
	}

	created := make([]PublishedAssignment, 0, len(userIDs))
	for _, uid := range userIDs {
		assignmentID := uuid.New()
		row := tx.QueryRow(
			ctx,
			`INSERT INTO survey_assignments (id, form_id, user_id, status, due_at)
			 VALUES ($1, $2, $3, 'pending', $4)
			 ON CONFLICT (form_id, user_id) DO NOTHING
			 RETURNING id`,
			assignmentID, formID, uid, dueAt,
		)

		var createdID uuid.UUID
		if err := row.Scan(&createdID); err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				continue
			}
			return nil, err
		}

		payload, err := json.Marshal(map[string]any{
			"form_id":       formID,
			"assignment_id": createdID,
		})
		if err != nil {
			return nil, err
		}

		if _, err := tx.Exec(
			ctx,
			`INSERT INTO in_app_notifications (id, user_id, type, title, payload)
			 VALUES ($1, $2, 'survey_assigned', $3, $4)`,
			uuid.New(), uid, fmt.Sprintf("Новая анкета: %s", formTitle), payload,
		); err != nil {
			return nil, err
		}

		created = append(created, PublishedAssignment{
			AssignmentID: createdID,
			UserID:       uid,
			FormID:       formID,
			FormTitle:    formTitle,
		})
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return created, nil
}

func (s *Store) ListAssignmentsByUser(ctx context.Context, userID uuid.UUID) ([]Assignment, error) {
	rows, err := s.pool.Query(
		ctx,
		`SELECT a.id, a.form_id, f.title, a.status, a.due_at, a.assigned_at, a.completed_at
		 FROM survey_assignments a
		 JOIN survey_forms f ON f.id = a.form_id
		 WHERE a.user_id = $1
		 ORDER BY a.assigned_at DESC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]Assignment, 0)
	for rows.Next() {
		var a Assignment
		if err := rows.Scan(&a.ID, &a.FormID, &a.FormTitle, &a.Status, &a.DueAt, &a.AssignedAt, &a.CompletedAt); err != nil {
			return nil, err
		}
		items = append(items, a)
	}
	return items, rows.Err()
}

type AnswerInput struct {
	QuestionID uuid.UUID
	Answer     json.RawMessage
}

func (s *Store) SubmitAssignment(ctx context.Context, userID, assignmentID uuid.UUID, answers []AnswerInput) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	var (
		dbUserID uuid.UUID
		formID   uuid.UUID
	)
	if err := tx.QueryRow(
		ctx,
		`SELECT user_id, form_id FROM survey_assignments WHERE id = $1`,
		assignmentID,
	).Scan(&dbUserID, &formID); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return errors.New("assignment not found")
		}
		return err
	}
	if dbUserID != userID {
		return errors.New("assignment does not belong to current user")
	}

	type dbQuestion struct {
		ID           uuid.UUID
		QuestionType string
		Required     bool
		Config       json.RawMessage
	}

	qRows, err := tx.Query(
		ctx,
		`SELECT id, question_type, required, config
		 FROM survey_questions
		 WHERE form_id = $1`,
		formID,
	)
	if err != nil {
		return err
	}
	defer qRows.Close()

	questions := make(map[uuid.UUID]dbQuestion)
	for qRows.Next() {
		var q dbQuestion
		if err := qRows.Scan(&q.ID, &q.QuestionType, &q.Required, &q.Config); err != nil {
			return err
		}
		questions[q.ID] = q
	}
	if err := qRows.Err(); err != nil {
		return err
	}
	if len(questions) == 0 {
		return errors.New("form has no questions")
	}

	answersByQuestion := make(map[uuid.UUID]json.RawMessage)
	for _, ans := range answers {
		if _, exists := questions[ans.QuestionID]; !exists {
			return errors.New("answer contains unknown question_id")
		}
		if _, exists := answersByQuestion[ans.QuestionID]; exists {
			return errors.New("duplicate answers for one question")
		}
		answersByQuestion[ans.QuestionID] = ans.Answer
	}

	for qid, q := range questions {
		raw, exists := answersByQuestion[qid]
		if q.Required && !exists {
			return errors.New("required question is missing in answers")
		}
		if !exists {
			continue
		}
		if err := validateAnswer(q.QuestionType, q.Required, q.Config, raw); err != nil {
			return err
		}
	}

	for _, ans := range answers {
		if _, err := tx.Exec(
			ctx,
			`INSERT INTO survey_answers (id, assignment_id, question_id, answer)
			 VALUES ($1, $2, $3, $4)
			 ON CONFLICT (assignment_id, question_id)
			 DO UPDATE SET answer = EXCLUDED.answer, updated_at = now()`,
			uuid.New(), assignmentID, ans.QuestionID, ans.Answer,
		); err != nil {
			return err
		}
	}

	if _, err := tx.Exec(
		ctx,
		`UPDATE survey_assignments
		 SET status = 'completed', completed_at = now(), updated_at = now()
		 WHERE id = $1`,
		assignmentID,
	); err != nil {
		return err
	}

	if err := tx.Commit(ctx); err != nil {
		return err
	}
	return nil
}

func validateAnswer(questionType string, required bool, configRaw json.RawMessage, answerRaw json.RawMessage) error {
	if strings.TrimSpace(string(answerRaw)) == "" || string(answerRaw) == "null" {
		if required {
			return errors.New("required question has empty answer")
		}
		return nil
	}

	switch questionType {
	case "text":
		var value string
		if err := json.Unmarshal(answerRaw, &value); err != nil {
			return errors.New("text answer must be string")
		}
		if required && strings.TrimSpace(value) == "" {
			return errors.New("text answer cannot be empty")
		}
		return nil
	case "single":
		var value string
		if err := json.Unmarshal(answerRaw, &value); err != nil {
			return errors.New("single answer must be string")
		}
		options, err := extractOptions(configRaw)
		if err != nil {
			return err
		}
		if _, ok := options[value]; !ok {
			return errors.New("single answer is not in options")
		}
		return nil
	case "multi":
		var values []string
		if err := json.Unmarshal(answerRaw, &values); err != nil {
			return errors.New("multi answer must be array of strings")
		}
		if required && len(values) == 0 {
			return errors.New("multi answer must contain at least one option")
		}
		options, err := extractOptions(configRaw)
		if err != nil {
			return err
		}
		seen := map[string]struct{}{}
		for _, v := range values {
			if _, ok := options[v]; !ok {
				return errors.New("multi answer contains option not in config")
			}
			if _, exists := seen[v]; exists {
				return errors.New("multi answer contains duplicate options")
			}
			seen[v] = struct{}{}
		}
		return nil
	case "rating":
		var value float64
		if err := json.Unmarshal(answerRaw, &value); err != nil {
			return errors.New("rating answer must be number")
		}
		if math.Mod(value, 1) != 0 {
			return errors.New("rating answer must be integer")
		}
		min, max, err := extractRatingRange(configRaw)
		if err != nil {
			return err
		}
		if value < min || value > max {
			return errors.New("rating answer is out of allowed range")
		}
		return nil
	default:
		return errors.New("unknown question type")
	}
}

func extractOptions(configRaw json.RawMessage) (map[string]struct{}, error) {
	var cfg struct {
		Options []string `json:"options"`
	}
	if len(configRaw) > 0 {
		if err := json.Unmarshal(configRaw, &cfg); err != nil {
			return nil, errors.New("invalid question config")
		}
	}
	if len(cfg.Options) == 0 {
		return nil, errors.New("question config options are required")
	}
	options := make(map[string]struct{}, len(cfg.Options))
	for _, opt := range cfg.Options {
		clean := strings.TrimSpace(opt)
		if clean == "" {
			return nil, errors.New("question option cannot be empty")
		}
		options[clean] = struct{}{}
	}
	return options, nil
}

func extractRatingRange(configRaw json.RawMessage) (float64, float64, error) {
	min := float64(1)
	max := float64(5)
	var cfg struct {
		Min *float64 `json:"min"`
		Max *float64 `json:"max"`
	}
	if len(configRaw) > 0 {
		if err := json.Unmarshal(configRaw, &cfg); err != nil {
			return 0, 0, errors.New("invalid rating config")
		}
	}
	if cfg.Min != nil {
		min = *cfg.Min
	}
	if cfg.Max != nil {
		max = *cfg.Max
	}
	if math.Mod(min, 1) != 0 || math.Mod(max, 1) != 0 || min >= max {
		return 0, 0, errors.New("rating config min/max are invalid")
	}
	return min, max, nil
}

func (s *Store) ListNotificationsByUser(ctx context.Context, userID uuid.UUID, limit, offset int) ([]Notification, error) {
	rows, err := s.pool.Query(
		ctx,
		`SELECT id, type, title, payload, is_read, created_at, read_at
		 FROM in_app_notifications
		 WHERE user_id = $1
		 ORDER BY created_at DESC
		 LIMIT $2 OFFSET $3`,
		userID, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]Notification, 0)
	for rows.Next() {
		var n Notification
		if err := rows.Scan(&n.ID, &n.Type, &n.Title, &n.Payload, &n.IsRead, &n.CreatedAt, &n.ReadAt); err != nil {
			return nil, err
		}
		items = append(items, n)
	}
	return items, rows.Err()
}

func (s *Store) UnreadCount(ctx context.Context, userID uuid.UUID) (int, error) {
	var count int
	if err := s.pool.QueryRow(
		ctx,
		`SELECT count(*) FROM in_app_notifications WHERE user_id = $1 AND is_read = false`,
		userID,
	).Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}

func (s *Store) MarkNotificationRead(ctx context.Context, userID, notificationID uuid.UUID) error {
	cmd, err := s.pool.Exec(
		ctx,
		`UPDATE in_app_notifications
		 SET is_read = true, read_at = now()
		 WHERE id = $1 AND user_id = $2`,
		notificationID, userID,
	)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return errors.New("notification not found")
	}
	return nil
}
