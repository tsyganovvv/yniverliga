FROM python:3.11-slim

WORKDIR /app

COPY services/django_admin/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY services/django_admin /app

CMD ["sh", "/app/entrypoint.sh"]
