# survey_service

Go service for survey forms, assignments, answers and in-app notifications.

## Environment

- `DATABASE_URL` (required)
- `AUTH_SERVICE_URL` (default `http://auth_service:8000`)
- `PORT` (default `8002`)

## Main endpoints

- `GET /health`
- `POST /v1/forms` (ADMIN/ROOT)
- `POST /v1/forms/{id}/questions` (ADMIN/ROOT)
- `POST /v1/forms/{id}/publish` (ADMIN/ROOT)
- `GET /v1/my/assignments`
- `POST /v1/assignments/{id}/submit`
- `GET /v1/my/notifications`
- `GET /v1/my/notifications/unread-count`
- `POST /v1/my/notifications/{id}/read`

All `/v1/*` endpoints require:

`Authorization: Bearer <session_token>`

The service validates session tokens by calling `auth_service` endpoint:

`GET /v1/sessions/`
