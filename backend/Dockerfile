FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Cloud Run sets PORT environment variable, default to 8080
ENV PORT 8080

CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
