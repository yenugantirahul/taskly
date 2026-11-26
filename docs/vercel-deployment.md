# Deploy the Taskly frontend on Vercel

The Next.js frontend lives in `apps/client`. Its API is deployed separately on
Render. Browser requests use same-origin `/api/*`; Next.js rewrites them to
`API_URL`, keeping session cookies on the frontend's domain.

## Vercel settings

1. Push the prepared frontend deployment changes to GitHub.
2. In Vercel, add a new project and import `yenugantirahul/taskly` from GitHub.
3. Choose the **Next.js** framework and set **Root Directory** to `apps/client`.
4. Enable inclusion of files outside the root directory if that option is shown;
   the pnpm workspace and lockfile live at the repository root.
5. Use **Node.js 24.x**. Set the build command to `pnpm run build`. Keep install
   command and output directory at their detected defaults. No Dockerfile or
   custom start command is needed.
6. Before deploying, add these variables to the **Production** environment:

   | Name | Value |
   | --- | --- |
   | `API_URL` | The Render API origin, for example `https://taskly-api-xxxx.onrender.com` |
   | `ENABLE_EXPERIMENTAL_COREPACK` | `1`, so Vercel uses the pinned pnpm 11.9.0 version |

   Do not append `/api` to the URL. Database credentials and Resend keys belong
   in Render. `API_URL` is read by Next.js config during the build, so it does
   not need the `NEXT_PUBLIC_` prefix.

7. Deploy. Copy the stable production origin assigned by Vercel, for example
   `https://taskly.vercel.app` (use your actual assigned address).
8. In Render, change the API's `APP_URL` to that exact frontend origin and deploy
   the environment change. This configures allowed browser origins and the
   destination of verification email links. It does not change `DATABASE_URL`.

The Vercel root directory differs from Render's setup: Vercel builds the client
package, while Render's Docker build needs the whole repository as its context.

## Verify the connection

- Open `/login`, `/signup`, and `/verify-email` on the frontend.
- In a private browser window, open `/api/auth/me` on the frontend domain. A JSON
  HTTP 401 response with `UNAUTHORIZED` is expected without a session. It proves
  the request reached the API; HTML 404 or gateway errors indicate routing issues.
- Register, receive the email, verify it, log in, and open the dashboard. With
  Resend's default test sender, use the Resend account owner's email address.
- Check that verification emails point to the Vercel frontend and that signing
  out returns you to the public pages.

The API's `/server/ping` endpoint belongs on the Render URL; our frontend rewrite
only proxies `/api/*`. Render Free may take about a minute to wake after idle
time. Wake/check the Render API directly before diagnosing a first-request timeout.

If browser writes fail with `FORBIDDEN_ORIGIN`, check Render's `APP_URL` against
the frontend origin shown in the browser address bar. Vercel preview domains
differ from production: the current API allows one configured frontend origin.
Use the production domain for the first full authentication test. Preview builds
need `API_URL` and Corepack variables in the Preview environment too, and should
use a separate staging API when testing writes/authentication.

Changes to `API_URL` require a new Vercel build/deployment. If invoking a root
Turbo build, the build task includes `API_URL` in its environment/cache key.

## Local development

The API defaults to `http://localhost:5000`. Copy `apps/client/.env.example` to
`apps/client/.env.local` to override it. Start the frontend from the repository
root with `pnpm --filter client dev`.

References: [Vercel monorepos](https://vercel.com/docs/monorepos),
[package managers](https://vercel.com/docs/package-managers),
[environment variables](https://vercel.com/docs/environment-variables), and
[external rewrites](https://vercel.com/docs/routing/rewrites).
