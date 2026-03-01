# API документация и cURL прогоны

Документ покрывает все текущие эндпоинты проекта:
- `auth_service` на `http://localhost:8000`
- `rate_service` на `http://localhost:8001`

Важно: в коде используется имя `rewiew` (не `review`) в путях/моделях. В командах ниже это уже учтено.

## 1. Быстрый запуск

```bash
docker compose -f backend/docker/docker-compose.yaml up -d postgres auth_service rate_service

docker compose -f backend/docker/docker-compose.yaml run --rm auth_service alembic upgrade head
docker compose -f backend/docker/docker-compose.yaml run --rm rate_service alembic upgrade head
```

## 2. Полный список эндпоинтов

### Auth service (`:8000`)

| Метод | Путь | Описание |
|---|---|---|
| GET | `/v1/api/health` | Базовый health-check API |
| GET | `/v1/departments/health` | Health-check модуля departments |
| POST | `/v1/departments/` | Создать департамент |
| GET | `/v1/departments/` | Список департаментов |
| GET | `/v1/users/health` | Health-check модуля users |
| POST | `/v1/users/` | Создать пользователя |
| GET | `/v1/users/` | Список пользователей (`skip`, `limit`) |
| GET | `/v1/users/{username}` | Получить пользователя по username |
| PUT | `/v1/users/{username}` | Обновить пользователя |
| DELETE | `/v1/users/{username}` | Удалить пользователя |
| GET | `/v1/sessions/health` | Health-check модуля sessions |
| POST | `/v1/sessions/` | Логин, выдача токена |
| GET | `/v1/sessions/` | Получить пользователя по токену |

### Rate service (`:8001`)

| Метод | Путь | Описание |
|---|---|---|
| GET | `/v1/topics/health` | Health-check модуля topics |
| POST | `/v1/topics/` | Создать тему |
| GET | `/v1/topics/` | Список тем |
| GET | `/v1/reviews/health` | Health-check модуля reviews |
| POST | `/v1/reviews/` | Создать отзыв |
| GET | `/v1/reviews/` | Список отзывов |
| GET | `/v1/reviews/from/{user_id}` | Отзывы от пользователя |
| GET | `/v1/reviews/to/{user_id}` | Отзывы на пользователя |
| GET | `/v1/reviews/category/{category}` | Отзывы по категории |
| GET | `/v1/reviews/positive/{is_positive}` | Отзывы по полярности |
| GET | `/v1/reviews/rate/{rate}` | Отзывы по оценке `rate` |

## 3. Форматы запросов

### 3.1 Departments

`POST /v1/departments/`

```json
{
  "name": "Engineering",
  "description": "Core product team"
}
```

### 3.2 Users

`POST /v1/users/`

```json
{
  "username": "alice",
  "fullname": "Alice A",
  "department_id": null,
  "password": "pass123"
}
```

`PUT /v1/users/{username}`

```json
{
  "username": "alice",
  "fullname": "Alice Updated",
  "department_id": null,
  "password": "newpass123"
}
```

### 3.3 Sessions

`POST /v1/sessions/`

```json
{
  "username": "alice",
  "password": "pass123"
}
```

Успешный логин возвращает заголовки:
- `X-Auth-Token: <token>`
- `Authorization: Bearer <token>`

Для `GET /v1/sessions/` передавайте:
- `Authorization: Bearer <token>`

### 3.4 Topics

`POST /v1/topics/`

```json
{
  "name": "Коммуникация",
  "categories": ["ясность", "доступность"],
  "is_positive": true,
  "is_active": true
}
```

### 3.5 Reviews

`POST /v1/reviews/`

```json
{
  "from_user_id": "<UUID>",
  "to_user_id": "<UUID>",
  "topic": "Коммуникация",
  "category": "ясность",
  "subcategories": ["ясность", "доступность"],
  "context": "Совместная подготовка релиза",
  "comment": "Быстро синхронизировал команду",
  "episode_key": "release-2026-03",
  "is_positive": true,
  "rate": 4
}
```

Ограничения:
- `rate`: от `1` до `5`
- уникальность эпизода: `(from_user_id, to_user_id, episode_key)`

## 4. cURL прогоны

### Прогон A: Health-check всех модулей

```bash
curl -sS http://localhost:8000/v1/api/health
curl -sS http://localhost:8000/v1/departments/health
curl -sS http://localhost:8000/v1/users/health
curl -sS http://localhost:8000/v1/sessions/health
curl -sS http://localhost:8001/v1/topics/health
curl -sS http://localhost:8001/v1/reviews/health
```

### Прогон B: Полный сценарий (CRUD + авторизация + отзывы)

```bash
AUTH=http://localhost:8000
RATE=http://localhost:8001

# 1) Создаем департамент
curl -sS -X POST "$AUTH/v1/departments/" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Engineering","description":"Core product team"}'

# 2) Создаем пользователей
curl -sS -X POST "$AUTH/v1/users/" \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","fullname":"Alice A","password":"pass123"}'

curl -sS -X POST "$AUTH/v1/users/" \
  -H 'Content-Type: application/json' \
  -d '{"username":"bob","fullname":"Bob B","password":"pass123"}'

# 3) Проверяем список пользователей
curl -sS "$AUTH/v1/users/"

# 4) Получаем UUID пользователей (без jq)
ALICE_ID=$(curl -sS "$AUTH/v1/users/alice" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
BOB_ID=$(curl -sS "$AUTH/v1/users/bob" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

# 5) Логинимся и извлекаем токен из заголовка
TOKEN=$(curl -si -X POST "$AUTH/v1/sessions/" \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"pass123"}' \
  | tr -d '\r' | awk -F': ' '/^x-auth-token:/{print $2}')

# 6) Проверяем токен
curl -sS -H "Authorization: Bearer $TOKEN" "$AUTH/v1/sessions/"

# 7) Создаем тему
curl -sS -X POST "$RATE/v1/topics/" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Коммуникация","categories":["ясность","доступность"],"is_positive":true,"is_active":true}'

# 8) Создаем отзыв
curl -sS -X POST "$RATE/v1/reviews/" \
  -H 'Content-Type: application/json' \
  -d "{\"from_user_id\":\"$ALICE_ID\",\"to_user_id\":\"$BOB_ID\",\"topic\":\"Коммуникация\",\"category\":\"ясность\",\"subcategories\":[\"ясность\",\"доступность\"],\"context\":\"Совместная подготовка релиза\",\"comment\":\"Быстро синхронизировал команду\",\"episode_key\":\"release-2026-03\",\"is_positive\":true,\"rate\":4}"

# 9) Фильтры по отзывам
curl -sS "$RATE/v1/reviews/"
curl -sS "$RATE/v1/reviews/from/$ALICE_ID"
curl -sS "$RATE/v1/reviews/to/$BOB_ID"
curl -sS "$RATE/v1/reviews/category/ясность"
curl -sS "$RATE/v1/reviews/positive/true"
curl -sS "$RATE/v1/reviews/rate/4"
```

### Прогон C: Проверка блокировки дубля эпизода

```bash
curl -sS -o /tmp/review_dup.json -w '%{http_code}\n' \
  -X POST "$RATE/v1/reviews/" \
  -H 'Content-Type: application/json' \
  -d "{\"from_user_id\":\"$ALICE_ID\",\"to_user_id\":\"$BOB_ID\",\"topic\":\"Коммуникация\",\"category\":\"ясность\",\"subcategories\":[\"ясность\"],\"context\":\"Повтор\",\"comment\":\"Повтор\",\"episode_key\":\"release-2026-03\",\"is_positive\":true,\"rate\":5}"
cat /tmp/review_dup.json
```

Ожидаемо: HTTP `400` с текстом про `duplicate key` и `uq_rewiew_episode_once`.

## 5. Примечания по текущему поведению API

- `GET /v1/users/` возвращает `404`, если пользователей нет.
- В `sessions` логин сейчас принимает поле `username`.
- Эндпоинты удаления/обновления не реализуют отдельную авторизацию на уровне роутов.
