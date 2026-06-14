# Note Taker App

A minimal note-taking application repository. Follow the repository's `Makefile` for the supported setup and run commands.

## Requirements

- Python 3.10+ (for local helper scripts)
- Docker & docker-compose (for containerized runs)

## Setup

1. Run the setup helper (this handles installing and preparing the environment):

   ```powershell
   make setup
   ```

2. Provide your MongoDB connection string by setting `MONGODB_URL` in `secrets/.env.backend`.

   Example cloud URL:

   ```text
   MONGODB_URL=mongodb+srv://user:password@cluster-url/
   ```

   Note: a cloud `MONGODB_URL` is required when using a hosted MongoDB service.
   The default password used in examples is `kingnote` — change this for real deployments.

## Run

- If you have already set `MONGODB_URL` in `secrets/.env.backend`, start the app with:

  ```powershell
  make start
  ```

- Otherwise bring up the full stack (build and run services) with:

  ```powershell
  make up
  ```

## Troubleshooting

- If the application cannot connect to MongoDB, verify `MONGODB_URL` is correct and reachable from your machine or container network.

## Next steps

Update this README with service endpoints, environment variable descriptions, and any developer notes as the project evolves.
