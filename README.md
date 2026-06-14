# Note Taker App

A minimal note-taking application repository. Follow the repository's `Makefile` for the supported setup and run commands.

## Requirements

- Python 3.10+ (for local helper scripts)
- Docker & docker-compose (for containerized runs)

## Setup

1. Provide your MongoDB connection string by setting `MONGODB_URL` in `scripts/.env.backend.example` only !!!!

   Example cloud URL:

   ```text
   MONGODB_URL=mongodb+srv://user:password@cluster-url/
   ```

   Note: a cloud `MONGODB_URL` is required when using a hosted MongoDB service.
   The default password used in examples is `kingnote` — change this for real deployments.

## Run

- to start the app run this cokmmand in the terminal it will automatically build and start the backend and frontend services and set up api key for the frontend to connect to the backend:

  ```powershell
  make start
  ```

- to down the app run this command in the terminal it will stop and remove the backend and frontend containers:

  ```powershell
  make down
  ```

- to restart the app run this command in the terminal:

  ```powershell
  make restart
  ```

  - to check live logs in the app run this command in the terminal:
  
  ```powershell
  make logs
  ```

## Troubleshooting

- If the application cannot connect to MongoDB, verify `MONGODB_URL` is correct and reachable from your machine or container network.

