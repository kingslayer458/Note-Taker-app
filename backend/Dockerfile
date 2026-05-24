FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
RUN addgroup --system --gid 1001 fastapi \
    && adduser --system --uid 1001 --gid 1001 fastapi

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chown -R fastapi:fastapi /app

USER fastapi

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
