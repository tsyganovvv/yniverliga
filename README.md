# Универлига: платформа командной обратной связи

Веб-платформа для внутренней обратной связи в командах:
- сотрудники оставляют отзывы коллегам;
- менеджеры анализируют динамику по командам;
- есть выгрузка отчетов и экспорт таблиц в Excel;
- дополнительно подключен сервис опросов.

## Содержание
- [1. Что внутри проекта](#1-что-внутри-проекта)
- [2. Архитектура](#2-архитектура)
- [3. Основной функционал](#3-основной-функционал)
- [4. API: подробное описание ручек](#4-api-подробное-описание-ручек)
- [5. Запуск проекта](#5-запуск-проекта)
- [6. Переменные окружения](#6-переменные-окружения)
- [7. Фронтенд: страницы и сценарии](#7-фронтенд-страницы-и-сценарии)
- [8. Полезные замечания](#8-полезные-замечания)

## 1. Что внутри проекта

Монорепозиторий состоит из:

- `frontend/www` - React + Vite приложение (порт `3000`);
- `backend/services/auth_service` - сервис пользователей/сессий/профилей (FastAPI, порт `8000`);
- `backend/services/rate_service` - сервис отзывов и топиков (FastAPI, порт `8001`);
- `backend/services/survey_service` - сервис опросов и уведомлений (Go, порт `8002`);
- `backend/services/django_admin` - Django-admin сервис;
- `backend/docker` и `frontend/docker` - docker-compose и docker-окружение.

## 2. Архитектура

```mermaid
flowchart LR
    FE["Frontend (React, :3000)"] --> AUTH["auth_service (:8000)"]
    FE --> RATE["rate_service (:8001)"]
    FE --> SURVEY["survey_service (:8002)"]

    SURVEY --> AUTH
    AUTH --> DB[(PostgreSQL :5432)]
    RATE --> DB
    SURVEY --> DB
```

Ключевая модель данных:
- `departments` -> `users` (обязательная связь через `department_id`);
- `topics` -> `rewiews` (по полю `topic`);
- `users` -> `rewiews` (`from_user_id`, `to_user_id`).

## 3. Основной функционал

### 3.1 Авторизация и сессии
- вход по логину/паролю через `POST /v1/sessions/`;
- токен возвращается:
  - в заголовках (`Auth-Token`, `X-Auth-Token`, `Authorization: Bearer ...`);
  - в body (`token`).
- проверка текущего пользователя по токену: `GET /v1/sessions/`.

### 3.2 Сотрудник
- страница `/team`;
- форма отзыва:
  - выбор команды;
  - выбор сотрудника внутри команды;
  - выбор топика и нескольких категорий;
  - оценка и комментарий;
  - отправка отзыва(ов) в `rate_service`.

### 3.3 Менеджер
- страница `/dashboard`;
- загрузка списка команд из API;
- запрос отзывов по выбранной команде;
- визуализация:
  - граф взаимодействий;
  - фильтруемая таблица отзывов;
  - экспорт текущей таблицы в Excel (`.xlsx`).

### 3.4 Отчеты
- `rate_service` поддерживает экспорт отчета:
  - `GET /v1/reviews/report/csv`
  - `GET /v1/reviews/report/excel`

## 4. API: подробное описание ручек

## 4.1 auth_service (`http://localhost:8000`)

Базовые health-ручки:
- `GET /v1/api/health`
- `GET /v1/sessions/health`
- `GET /v1/users/health`
- `GET /v1/departments/health`
- `GET /v1/profiles/health`

### 4.1.1 Сессии

1. `POST /v1/sessions/` - логин
   - body:
     ```json
     {
       "username": "your_username",
       "password": "your_password"
     }
     ```
   - успешный ответ: `200`
     ```json
     {
       "message": "login success",
       "token": "..."
     }
     ```
   - также токен приходит в заголовках.

2. `GET /v1/sessions/` - получить пользователя по токену
   - header: `Authorization: Bearer <token>`
   - успешный ответ: `200` (объект пользователя с ролью и `department_id`).

### 4.1.2 Пользователи

1. `POST /v1/users/` - создать пользователя  
   body:
   ```json
   {
     "username": "ivan.petrov",
     "fullname": "Иван Петров",
     "department_id": "UUID",
     "password": "secret"
   }
   ```

2. `GET /v1/users/?skip=0&limit=100` - список пользователей  
3. `GET /v1/users/{username}` - пользователь по username  
4. `PUT /v1/users/{username}` - обновление пользователя  
5. `DELETE /v1/users/{username}` - удаление пользователя

### 4.1.3 Отделы

1. `POST /v1/departments/` - создать отдел  
   body:
   ```json
   {
     "name": "Разработка продукта",
     "description": "Команда разработки и поддержки"
   }
   ```
2. `GET /v1/departments/` - список отделов

### 4.1.4 Профили

1. `GET /v1/profiles/by-id/{user_id}`  
2. `GET /v1/profiles/by-username/{username}`  
3. `POST /v1/profiles/{user_id}/photo` - загрузка фото (`multipart/form-data`)

---

## 4.2 rate_service (`http://localhost:8001`)

Health:
- `GET /v1/reviews/health`
- `GET /v1/topics/health`

### 4.2.1 Топики

1. `POST /v1/topics/`  
   body:
   ```json
   {
     "name": "Соблюдение сроков",
     "categories": ["Планирование", "Ответственность"],
     "is_positive": true,
     "is_active": true
   }
   ```

2. `GET /v1/topics/` - список топиков с категориями

### 4.2.2 Отзывы

1. `POST /v1/reviews/` - создать отзыв  
   body:
   ```json
   {
     "from_user_id": "UUID",
     "to_user_id": "UUID",
     "topic": "Соблюдение сроков",
     "category": "Ответственность",
     "context": "Комментарий",
     "is_positive": true,
     "rate": 5
   }
   ```

2. `GET /v1/reviews/` - все отзывы  
3. `GET /v1/reviews/from/{user_id}` - отзывы от пользователя  
4. `GET /v1/reviews/to/{user_id}` - отзывы к пользователю  
5. `GET /v1/reviews/category/{category}` - фильтр по категории  
6. `GET /v1/reviews/positive/{is_positive}` - позитив/негатив  
7. `GET /v1/reviews/rate/{rate}` - фильтр по оценке  
8. `GET /v1/reviews/department/{department_id}` - отзывы по команде (департаменту)  
9. `GET /v1/reviews/report/csv` - скачать CSV-отчет  
10. `GET /v1/reviews/report/excel` - скачать XLSX-отчет

---

## 4.3 survey_service (`http://localhost:8002`)

Health:
- `GET /health`

Все ручки `/v1/*` требуют:
- `Authorization: Bearer <session_token>`

Ручки:

1. `GET /v1/forms` (ADMIN/ROOT)
2. `POST /v1/forms` (ADMIN/ROOT)
3. `GET /v1/forms/{id}` (ADMIN/ROOT)
4. `POST /v1/forms/{id}/questions` (ADMIN/ROOT)
5. `POST /v1/forms/{id}/publish` (ADMIN/ROOT)
6. `GET /v1/my/assignments`
7. `POST /v1/assignments/{id}/submit`
8. `GET /v1/my/notifications`
9. `GET /v1/my/notifications/unread-count`
10. `POST /v1/my/notifications/{id}/read`

## 5. Запуск проекта

### 5.1 Быстрый старт через Docker (рекомендуется)

1. Поднимите backend:
```bash
cd backend/docker
docker compose up --build
```

2. Поднимите frontend:
```bash
cd frontend/docker
docker compose up --build
```

После запуска:
- Frontend: `http://localhost:3000`
- Auth API: `http://localhost:8000`
- Rate API: `http://localhost:8001`
- Survey API: `http://localhost:8002`
- PostgreSQL: `localhost:5432`

### 5.2 Локальный запуск без Docker

Требования:
- Python `3.10+`
- Node.js `18+`
- Go `1.22+` (для `survey_service`)
- PostgreSQL

#### auth_service
```bash
cd backend/services/auth_service
poetry install
# .env должен содержать DATABASE_URL
poetry run uvicorn app.main:app --reload --port 8000
```

#### rate_service
```bash
cd backend/services/rate_service
poetry install
# .env должен содержать DATABASE_URL
poetry run uvicorn app.main:app --reload --port 8001
```

#### survey_service
```bash
cd backend/services/survey_service
# обязательный DATABASE_URL
# опционально AUTH_SERVICE_URL и PORT
go run ./cmd/api
```

#### frontend
```bash
cd frontend/www
npm install
npm run dev
```

## 6. Переменные окружения

### 6.1 Backend

`auth_service/.env`:
```env
DATABASE_URL=postgresql+asyncpg://postgres:main0000@localhost:5432/postgres
```

`rate_service/.env`:
```env
DATABASE_URL=postgresql+asyncpg://postgres:main0000@localhost:5432/postgres
```

`survey_service`:
```env
DATABASE_URL=postgresql://postgres:main0000@localhost:5432/postgres
AUTH_SERVICE_URL=http://localhost:8000
PORT=8002
```

### 6.2 Frontend

`frontend/www/.env` (или `.env.local`):
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_RATE_API_BASE_URL=http://localhost:8001
```

## 7. Фронтенд: страницы и сценарии

Роуты:
- `/` - welcome/login;
- `/team` - кабинет сотрудника (форма отзыва);
- `/dashboard` - кабинет менеджера;
- `/profile` - профиль;
- `/employee/:employeeId` - страница сотрудника;
- `/notifications` - уведомления.

### 7.1 Сотрудник (`/team`)
- загрузка команд, сотрудников и топиков;
- выбор сотрудника внутри выбранной команды;
- выбор нескольких категорий;
- отправка отзывов в `rate_service`.

### 7.2 Менеджер (`/dashboard`)
- фильтр по команде;
- загрузка отзывов через `GET /v1/reviews/department/{department_id}`;
- граф связей и таблица отзывов на одних данных;
- экспорт текущей таблицы в Excel.

### 7.3 Защита роутов
- приватные страницы доступны только при валидной сессии (`RequireSession`);
- роль берется из сессии и хранится в `localStorage`.

## 8. Полезные замечания

1. В коде исторически используется имя сущности `rewiew` (с опечаткой). Это нормально для текущего API-контракта.
2. При старте `auth_service` и `rate_service` применяют `seed_data` и создают базовые данные.
3. FastAPI docs доступны по стандартным адресам:
   - `http://localhost:8000/docs`
   - `http://localhost:8001/docs`


