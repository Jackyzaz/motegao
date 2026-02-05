# Nginx Reverse Proxy Setup

## Architecture

- **Port 80**: Nginx entry point
- **/** → Next.js app (port 3000)
- **/api** → FastAPI backend (port 8000)

## Quick Start

```bash
docker compose -f docker-compose.production.yml up -d
```

Access your application:

- **Frontend**: http://localhost
- **API Docs**: http://localhost/api/docs
- **API**: http://localhost/api/\*

## Configuration

### Nginx Config ([nginx.conf](nginx.conf))

- Reverse proxy to Next.js on root path
- Reverse proxy to FastAPI on `/api` path
- Rewrites `/api/*` to `/*` when forwarding to FastAPI
- Health check endpoint at `/health`

### Environment Variables

Update [.env.production](.env.production):

```bash
# API will be accessed through /api path
NEXT_PUBLIC_API_URL=http://localhost/api

# Or for production domain
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

## Path Rewriting

Nginx automatically rewrites paths:

- Request: `http://localhost/api/users` → FastAPI receives: `/users`
- Request: `http://localhost/api/docs` → FastAPI receives: `/docs`

## SSL/HTTPS Setup

For production with SSL, update [nginx.conf](nginx.conf):

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # ... rest of configuration
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

Mount SSL certificates in docker-compose:

```yaml
nginx:
  volumes:
    - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    - ./ssl:/etc/nginx/ssl:ro
```

## Custom Domain

1. Update nginx.conf `server_name` to your domain
2. Update `.env.production`:
   ```bash
   NEXT_PUBLIC_API_URL=https://yourdomain.com/api
   ```
3. Rebuild and restart:
   ```bash
   docker compose -f docker-compose.production.yml up -d --build
   ```

## Testing

```bash
# Test frontend
curl http://localhost

# Test API
curl http://localhost/api/docs

# Test health check
curl http://localhost/health
```

## Troubleshooting

### Check nginx logs

```bash
docker logs motegao-nginx-prod
```

### Test nginx config

```bash
docker exec motegao-nginx-prod nginx -t
```

### Reload nginx config without restart

```bash
docker exec motegao-nginx-prod nginx -s reload
```
