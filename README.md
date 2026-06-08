<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/2a7450f2-38e9-425f-bc6c-3056c9c55964

## Run Locally

**Prerequisites:** Node.js and PostgreSQL. Docker is not required.


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env`.
3. Set `DATABASE_URL` to a local or managed PostgreSQL connection string.
   Example: `postgres://user:password@localhost:5432/anysoul`
4. Initialize or re-apply the schema:
   `npm run db:init`
5. Optional AI/media variables: `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`, `TMDB_API_KEY`.
6. Start the content API:
   `npm run server:dev`
7. Run the app:
   `npm run dev`

## Image uploads and object storage

The workspace and post editor can upload JPEG, PNG, WebP and GIF images. Uploaded files are recorded in `media_assets`.

Local development:
- Keep `OBJECT_STORAGE_DRIVER="local"`.
- Files are saved under `server/data/uploads`.
- URLs are served by the content API under `/uploads/...`.

S3-compatible object storage:
- Set `OBJECT_STORAGE_DRIVER="s3"` or `"r2"`.
- Configure `OBJECT_STORAGE_ENDPOINT`, `OBJECT_STORAGE_BUCKET`, `OBJECT_STORAGE_REGION`, `OBJECT_STORAGE_ACCESS_KEY_ID` and `OBJECT_STORAGE_SECRET_ACCESS_KEY`.
- Set `OBJECT_STORAGE_PUBLIC_BASE_URL` to the public bucket/custom-domain URL used by browsers.
- `OBJECT_STORAGE_FORCE_PATH_STYLE="true"` works well for Cloudflare R2 and many S3-compatible providers.

## Separate Frontend and Backend Deployment

Frontend deployment:
- Build with `npm run build`.
- Deploy `dist/` to a static host such as Nginx, Vercel, Netlify or a CDN.
- Set `VITE_CONTENT_API_URL` to the public backend API URL before building.

Backend deployment:
- Run `npm ci`.
- Set `NODE_ENV=production`, `DATABASE_URL`, `CONTENT_API_PORT`, `CONTENT_API_CORS_ORIGINS`, `APP_URL`, `OWNER_ACCOUNT_IDS` and the build-time `VITE_CONTENT_API_URL`.
- Run `npm run build`, `npm run server:build`, then `npm run db:init` once after connecting PostgreSQL.
- Start the API with `npm run server:start` under a process manager such as PM2, systemd or your hosting platform command.
- Use the samples in `deploy/` for Nginx, systemd, PM2 and the production checklist.

Production hardening:
- `NODE_ENV=production` validates required database, CORS and owner settings on startup.
- `CONTENT_API_REQUIRE_HTTPS=true` rejects direct non-HTTPS API requests behind a reverse proxy.
- Security headers are enabled by default with `CONTENT_API_SECURITY_HEADERS=true`.
- Login, registration and admin write operations are rate-limited by the app.
- Keep Nginx rate limits and `client_max_body_size` aligned with the app limits.

Database storage:
- Authentication, sessions and watched records are stored in PostgreSQL.
- Published/draft content entries are stored in `content_entries`.
- Publish/review events are stored in `content_events`.
- Blog posts are supported by `posts` and `post_revisions`.
- Gallery/media structures are supported by `media_assets` and `artwork_items`.
- User submissions are supported by `content_submissions`.
- Screenings can be structured through `screening_sources` and `screening_weeks`.

When `DATABASE_URL` is configured, the content API uses PostgreSQL for page content, gallery, screenings, submissions and publish state. If `content_entries` is empty, the server imports the existing JSON content store or the bundled defaults on startup.

## Auth and roles

- The first registered account becomes `owner` / 站主.
- Later registrations become `user` / 普通用户.
- `owner` can manage users and all workspace controls.
- `admin` can control workspace content but cannot manage users.
- `user` and guests can view the workspace in read-only mode.

The schema used by the content API is in `server/schema.sql`. The server also creates these tables automatically when `DATABASE_URL` is configured.
