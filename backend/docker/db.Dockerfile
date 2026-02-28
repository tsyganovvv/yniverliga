FROM postgres:15-alpine

ENV POSTGRES_DB=postgres
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=main0000

VOLUME /var/lib/postgresql/data

EXPOSE 5432