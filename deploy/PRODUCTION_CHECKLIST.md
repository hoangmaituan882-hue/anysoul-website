# Production Deployment Checklist

## 1. Environment

- Copy `.env.production.example` to `.env` on the server.
- Set `NODE_ENV=production`.
- Replace `APP_URL`, `VITE_CONTENT_API_URL` and `CONTENT_API_CORS_ORIGINS`.
- Replace `OWNER_ACCOUNT_IDS`; do not keep the development default.
- Set a managed or backed-up PostgreSQL `DATABASE_URL`.
- Configure object storage for production uploads, or document persistent disk backup if using `OBJECT_STORAGE_DRIVER=local`.

## 2. Build

```bash
npm ci
npm run db:init
npm run build
npm run server:build
```

For production-only runtime after building:

```bash
npm prune --omit=dev
```

## 3. Reverse Proxy and HTTPS

- Install the frontend `dist/` under `/var/www/anysoul/dist`.
- Install `deploy/nginx.proxy-headers.conf` as `/etc/nginx/snippets/proxy-headers.conf`.
- Install and edit `deploy/nginx.anysoul.conf`.
- Issue HTTPS certificates for both site and API domains.
- Verify the API receives `X-Forwarded-Proto: https`.
- Keep `CONTENT_API_REQUIRE_HTTPS=true` after HTTPS is confirmed.

## 4. Process Supervision

Choose one:

- systemd: install `deploy/anysoul-api.service`, then run `systemctl enable --now anysoul-api`.
- PM2: install `deploy/ecosystem.config.cjs`, then run `pm2 start deploy/ecosystem.config.cjs && pm2 save`.

Verify:

```bash
curl https://api.example.com/api/health
```

## 5. Security Checks

- Confirm `/api/auth/login` and `/api/auth/register` are rate-limited by both Nginx and the app.
- Confirm unknown origins are rejected by CORS.
- Confirm HTTP requests redirect to HTTPS at Nginx.
- Confirm direct HTTP to the API app returns `HTTPS is required` when `NODE_ENV=production`.
- Confirm response headers include `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and `Strict-Transport-Security`.
- Confirm upload size is bounded by both Nginx `client_max_body_size` and `MEDIA_UPLOAD_MAX_BYTES`.

## 6. Backups

- Schedule PostgreSQL backups with retention.
- If local uploads are used, back up `server/data/uploads`.
- If object storage is used, enable bucket lifecycle/versioning where available.
- Test restoring database and media files before public launch.

## 7. Smoke Tests

- Register the first owner account.
- Log in and verify the owner role.
- Publish a small content change from the workspace.
- Upload an image from the article editor.
- Create and publish a test article.
- Verify frontend routes: `#posts`, `#plaza`, `#screenings`, `#workspace`.
- Review server logs after the smoke test.
