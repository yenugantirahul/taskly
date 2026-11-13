# Deploy the API on Render Free with Neon

This deploys the API only. The Next.js frontend needs its own deployment and API
proxy configuration before browser authentication and verification links work.

## Accounts and database

1. Connect Render to the GitHub account that can access this repository.
2. Create a Neon Free project and database in a region close to the Render service.
3. In Neon's connection dialog, turn **connection pooling off**. Copy the direct
   PostgreSQL URL with its TLS parameters unchanged. Enter it only in Render's
   environment settings, never in source control or chat.
4. Create a Resend API key. For an initial test, use `Taskly <onboarding@resend.dev>`
   as the sender and send only to the email address of the Resend account owner.
   Verify an owned domain in Resend before sending to other recipients. The
   hosting URLs are free; acquiring a custom email domain may cost money.

## Deploy

Push the deployment files to GitHub. In Render, choose **New > Blueprint**, select
`yenugantirahul/taskly`, and use the root `render.yaml`. Confirm the web service
uses the **Free** plan and enter:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Neon direct URL, including the supplied TLS parameters |
| `APP_URL` | The frontend origin, such as `https://your-app.example` |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Verified sender, or the restricted test sender above |

If the frontend is not deployed, `APP_URL` can temporarily be the API's HTTPS
origin for API smoke tests. Verification links require the frontend's
`/verify-email` page, so update `APP_URL` before testing a complete signup flow.

The Blueprint sets `HOST=0.0.0.0`, `PORT=10000`, `NODE_ENV=production`, and
`MIGRATE_ON_START=true`. Leave `SMTP_URL` and `REDIS_URL` unset. Render builds from
the repository root using `apps/server/Dockerfile` and supplies HTTPS. Subsequent
automatic deployments wait for the GitHub CI checks to pass.

Render Free has no pre-deploy command, so startup applies the bundled migrations
before opening the HTTP port. A PostgreSQL session advisory lock serializes
migrations. Always use a direct connection for this lock. If using a pooled
`DATABASE_URL` later, set `MIGRATION_DATABASE_URL` to a direct connection URL.
Migrations and lock acquisition have a two-minute per-statement timeout; this is
intended for this small free-tier deployment. Keep schema changes compatible
with the previous running application version. Failed migrations prevent startup.

## Verify

Look for `Database migrations complete`, `Connected to database`, and
`Server started at 10000` in Render's logs. Check the actual URL Render assigns:

```sh
curl --fail https://YOUR-SERVICE.onrender.com/server/ping
curl --fail https://YOUR-SERVICE.onrender.com/server/ready
```

Expect `pong` and `{"status":"ready"}` respectively. Readiness failures return
HTTP 503 without exposing database details. CI also verifies a fresh migration,
a repeated migration, container startup, the endpoints, and the non-root UID.

Render Free sleeps after 15 idle minutes; the next request can take about a minute.
It blocks common SMTP ports, so this deployment uses Resend over HTTPS. Neon Free
has compute and storage quotas. This setup is for development/demo use.

## Rollback and upgrades

In Render's deployment history, redeploy the previous successful release. An
application rollback does not undo database migrations; use a forward fix for
schema problems. Before holding valuable user data, arrange backups and test a
restore. For multiple replicas or paid hosting, move migrations into a separate
release job and set `MIGRATE_ON_START=false`.

References: [Render Blueprints](https://render.com/docs/blueprint-spec),
[Render deployment lifecycle](https://render.com/docs/deploys),
[Render Free limits](https://render.com/docs/free),
[Neon connection setup](https://neon.com/docs/connect/connect-from-any-app),
[Resend test sender](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain).
