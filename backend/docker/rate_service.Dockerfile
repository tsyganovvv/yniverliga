FROM python:3.11-slim

WORKDIR /app

COPY services/rate_service .

RUN pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-interaction

CMD ["sh", "-c", "python app/main.py"]
