# VaultBoard

Small three-tier task board (React + Express + PostgreSQL) used as the target for a DevSecOps pipeline.

## Run

    cp .env.example .env     # then edit the password
    docker compose up --build

Open http://localhost:8080

## Test

    cd backend && npm install && npm test
