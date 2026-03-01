package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

func EnsureSchema(ctx context.Context, pool *pgxpool.Pool) error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS survey_forms (
			id UUID PRIMARY KEY,
			title TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			status TEXT NOT NULL DEFAULT 'draft',
			created_by UUID NOT NULL,
			due_at TIMESTAMPTZ NULL,
			published_at TIMESTAMPTZ NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			CONSTRAINT ck_survey_forms_status CHECK (status IN ('draft', 'published', 'archived'))
		)`,
		`CREATE TABLE IF NOT EXISTS survey_questions (
			id UUID PRIMARY KEY,
			form_id UUID NOT NULL REFERENCES survey_forms(id) ON DELETE CASCADE,
			question_type TEXT NOT NULL,
			title TEXT NOT NULL,
			required BOOLEAN NOT NULL DEFAULT false,
			position INTEGER NOT NULL,
			config JSONB NOT NULL DEFAULT '{}'::jsonb,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			CONSTRAINT ck_survey_questions_type CHECK (question_type IN ('single', 'multi', 'text', 'rating'))
		)`,
		`CREATE UNIQUE INDEX IF NOT EXISTS uq_survey_questions_form_position
			ON survey_questions(form_id, position)`,
		`CREATE TABLE IF NOT EXISTS survey_assignments (
			id UUID PRIMARY KEY,
			form_id UUID NOT NULL REFERENCES survey_forms(id) ON DELETE CASCADE,
			user_id UUID NOT NULL,
			status TEXT NOT NULL DEFAULT 'pending',
			due_at TIMESTAMPTZ NULL,
			assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			completed_at TIMESTAMPTZ NULL,
			updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			CONSTRAINT ck_survey_assignments_status CHECK (status IN ('pending', 'completed'))
		)`,
		`CREATE UNIQUE INDEX IF NOT EXISTS uq_survey_assignments_form_user
			ON survey_assignments(form_id, user_id)`,
		`CREATE INDEX IF NOT EXISTS ix_survey_assignments_user_status
			ON survey_assignments(user_id, status)`,
		`CREATE TABLE IF NOT EXISTS survey_answers (
			id UUID PRIMARY KEY,
			assignment_id UUID NOT NULL REFERENCES survey_assignments(id) ON DELETE CASCADE,
			question_id UUID NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
			answer JSONB NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
		)`,
		`CREATE UNIQUE INDEX IF NOT EXISTS uq_survey_answers_assignment_question
			ON survey_answers(assignment_id, question_id)`,
		`CREATE TABLE IF NOT EXISTS in_app_notifications (
			id UUID PRIMARY KEY,
			user_id UUID NOT NULL,
			type TEXT NOT NULL,
			title TEXT NOT NULL,
			payload JSONB NOT NULL DEFAULT '{}'::jsonb,
			is_read BOOLEAN NOT NULL DEFAULT false,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			read_at TIMESTAMPTZ NULL
		)`,
		`CREATE INDEX IF NOT EXISTS ix_notifications_user_read_created
			ON in_app_notifications(user_id, is_read, created_at DESC)`,
	}

	for _, q := range queries {
		if _, err := pool.Exec(ctx, q); err != nil {
			return fmt.Errorf("ensure schema: %w", err)
		}
	}
	return nil
}
