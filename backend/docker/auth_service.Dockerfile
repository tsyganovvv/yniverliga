FROM python:3.11-slim

WORKDIR /app

COPY services/auth_service .

RUN pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-interaction

CMD ["sh", "-c", "alembic upgrade head && python app/main.py"]
