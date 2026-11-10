FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

ARG APP_ENV=production
ENV APP_ENV=${APP_ENV}

# Real .env.<environment> files are gitignored — mount or inject one at runtime
# (docker-compose env_file, `docker run --env-file`, or platform secrets).
EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
