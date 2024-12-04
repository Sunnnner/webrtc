FROM python:3.11.9-alpine3.20

RUN pip install poetry

COPY . /app

WORKDIR /app

RUN poetry install --only main --no-root

RUN export PYTHONPATH=$PYTHONPATH:/app

CMD ["poetry", "run", "fastapi", "run", "--workers", "1"]
