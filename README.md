# Taskly

Deployment: [Render Free + Neon API setup](docs/deployment.md).

## Development

Install the workspace dependencies from the repository root with `pnpm install`.
Configure `apps/server/.env` using `apps/server/.env.example`.

With Docker running, start the database and both apps with:

```sh
pnpm dev
```

Docker Compose waits for PostgreSQL to become healthy, then Turborepo runs the
client and server development scripts concurrently. Stop the apps with Ctrl+C.
The database stays running until `pnpm deps:down`.

## Other root commands

To build and run the API in Docker with PostgreSQL, Redis, and Mailpit:

```sh
docker compose --profile api up -d --build --wait
curl http://localhost:5000/server/ping
docker compose exec api id
```

The endpoint returns `pong`. The API runs as the non-root `node` user and connects
to PostgreSQL at `postgres:5432` on the Compose network. Runtime environment
variables are configured in `docker-compose.yml`; `APP_URL` and `EMAIL_FROM` can
be overridden in the root `.env` or shell. The database credentials are for local
development. Environment files are excluded from the image.

The `api` profile keeps the container optional when using `pnpm dev`. Stop the API
container with `docker compose stop api` before running the API on the host.

- `pnpm build`: build the apps.
- `pnpm start`: start both apps after building; the database must already be running
  and the server environment variables must be supplied by the runtime.
- `pnpm lint`: run available workspace lint scripts.
- `pnpm typecheck`: run available workspace typecheck scripts.
- `pnpm deps:up` / `pnpm deps:down`: manage PostgreSQL independently.

Keep each app's scripts in its own `package.json`: Turborepo calls those scripts
when you run the root commands.

## Adding dependencies from the root

All of these commands run from the repository root:

```sh
# Root package
pnpm add <package>
pnpm add -D <package>

# Server package
pnpm --filter @minitrigger/server add <package>
pnpm --filter @minitrigger/server add -D <package>

# Client package
pnpm --filter client add <package>
```

`ignoreWorkspaceRootCheck: true` permits plain `pnpm add` at the root. That
command updates the root package; it does not add the dependency to every app.
Use `--filter` to select an app without changing directories. Turbo runs app
scripts, while pnpm manages which package owns each dependency.
