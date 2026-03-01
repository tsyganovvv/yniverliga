FROM golang:1.24-alpine

WORKDIR /app

COPY services/survey_service/go.mod ./
COPY services/survey_service/go.sum ./
RUN go mod download

COPY services/survey_service/ ./

RUN go build -o /survey_service ./cmd/api

EXPOSE 8002

CMD ["/survey_service"]
