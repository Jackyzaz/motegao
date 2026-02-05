# Docker Compose Production Setup

Production-ready Docker Compose configuration for the Motegao application.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

## Quick Start

### 1. Setup Environment Variables

Copy the example environment file and update with your production values:

```bash
cp .env.production.example .env.production
```

**IMPORTANT**: Update the following in `.env.production`:

- `MONGO_ROOT_PASSWORD` - Strong MongoDB password
- `REDIS_PASSWORD` - Strong Redis password
- `SECRET_KEY` - Secure secret key (minimum 32 characters)
- `NEXT_PUBLIC_API_URL` - Your production API URL
- `ALLOWED_HOSTS` - Comma-separated list of allowed hosts

### 2. Start Services

```bash
docker-compose -f docker-compose.production.yml --env-file .env.production up -d
```

### 3. Verify Services

```bash
# Check all services are running
docker-compose -f docker-compose.production.yml ps

# Check logs
docker-compose -f docker-compose.production.yml logs -f
```

## Services

### MongoDB

- **Container**: motegao-mongodb-prod
- **Port**: 27017 (internal network only)
- **Persistent Storage**: mongodb_data volume

### Redis

- **Container**: motegao-redis-prod
- **Port**: 6379 (internal network only)
- **Persistent Storage**: redis_data volume

### API (FastAPI)

- **Container**: motegao-api-prod
- **Port**: 8000 (configurable via API_PORT)
- **Health Check**: /docs endpoint
- **Dependencies**: MongoDB, Redis

### App (Next.js)

- **Container**: motegao-app-prod
- **Port**: 3000 (configurable via APP_PORT)
- **Dependencies**: API

## Management Commands

### View Logs

```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f api
docker-compose -f docker-compose.production.yml logs -f app
```

### Restart Services

```bash
# All services
docker-compose -f docker-compose.production.yml restart

# Specific service
docker-compose -f docker-compose.production.yml restart api
```

### Stop Services

```bash
docker-compose -f docker-compose.production.yml down
```

### Rebuild and Deploy

```bash
# Rebuild images
docker-compose -f docker-compose.production.yml build --no-cache

# Deploy with new images
docker-compose -f docker-compose.production.yml up -d
```

### Database Backup

```bash
# MongoDB backup
docker exec motegao-mongodb-prod mongodump --uri="mongodb://admin:${MONGO_ROOT_PASSWORD}@localhost:27017/motegaodb?authSource=admin" --out=/tmp/backup

# Copy backup from container
docker cp motegao-mongodb-prod:/tmp/backup ./mongodb-backup-$(date +%Y%m%d)
```

### Scale Services (if needed)

```bash
# Scale API instances
docker-compose -f docker-compose.production.yml up -d --scale api=3
```

## Security Considerations

1. **Environment Variables**: Never commit `.env.production` to version control
2. **Passwords**: Use strong, randomly generated passwords
3. **SECRET_KEY**: Generate using: `openssl rand -hex 32`
4. **Network**: Services communicate on isolated bridge network
5. **Volumes**: Persistent data stored in named volumes

## Production Deployment

For production deployment behind a reverse proxy (nginx/traefik):

1. Remove port mappings from docker-compose.production.yml
2. Configure reverse proxy to route to `motegao-app-prod:3000`
3. Set `NEXT_PUBLIC_API_URL` to your public API domain
4. Set `ALLOWED_HOSTS` to your specific domains
5. Enable SSL/TLS at the reverse proxy level

## Monitoring

All services include health checks:

- MongoDB: Database ping check
- Redis: Connection check
- API: HTTP endpoint check (/docs)
- App: HTTP endpoint check (/)

View health status:

```bash
docker-compose -f docker-compose.production.yml ps
```

## Troubleshooting

### Service won't start

```bash
# Check logs for specific service
docker-compose -f docker-compose.production.yml logs api

# Check health status
docker inspect motegao-api-prod --format='{{.State.Health.Status}}'
```

### Database connection issues

```bash
# Verify MongoDB is accessible
docker exec motegao-api-prod ping mongodb

# Check MongoDB logs
docker-compose -f docker-compose.production.yml logs mongodb
```

### Reset volumes (WARNING: deletes all data)

```bash
docker-compose -f docker-compose.production.yml down -v
```
