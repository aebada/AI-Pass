FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

ENV OCR_HOST=0.0.0.0
ENV OCR_PORT=8100
ENV OCR_STUB_MODE=1

EXPOSE 8100

CMD ["python", "-m", "app.main"]
