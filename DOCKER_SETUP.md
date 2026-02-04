# Docker Compose Setup for Motegao

This Docker Compose configuration runs the FastAPI backend, Next.js frontend, MongoDB, and Redis Stack services.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

## Quick Start

### Start all services (Development)

```bash
docker-compose up -d
```

This will:

- Build and start the API service on `http://localhost:8000`
- Build and start the app service on `http://localhost:3000`
- Start MongoDB on `mongodb://localhost:27017`
- Start Redis on `redis://localhost:6379`

### Start all services (Production)

```bash
docker-compose -f docker-compose.production.yml up -d
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f app
docker-compose logs -f mongodb
docker-compose logs -f redis
```

### Stop all services

```bash
docker-compose down

# With volume cleanup (removes data)
docker-compose down -v
```

## Services

### MongoDB

- **Port**: 27017
- **Container**: motegao-mongodb
- **Default Username**: admin
- **Default Password**: password (development) / ${MONGO_PASSWORD} (production)
- **Data Volume**: mongodb_data

### Redis Stack Server

- **Port**: 6379
- **Container**: motegao-redis
- **Default Password**: redis_password (development) / ${REDIS_PASSWORD} (production)
- **Data Volume**: redis_data
- **Features**: Full Redis Stack with modules support

### API (FastAPI Backend)

- **Port**: 8000
- **Container**: motegao-api
- **URL**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Environment**: Development mode with auto-reload
- **Dependencies**: MongoDB, Redis

### App (Next.js Frontend)

- **Port**: 3000
- **Container**: motegao-app
- **URL**: http://localhost:3000
- **Environment**: Development mode
- **API URL**: http://localhost:8000 (configurable via `NEXT_PUBLIC_API_URL`)

## Development Workflow

### Live Reload

Both API and App services have volume mounts for live reload during development:

- **API**: Changes to `motegao/` directory automatically reload
- **App**: Changes to `app/` directory automatically reload

### Connect to Services from Host

```bash
# MongoDB
mongosh mongodb://admin:password@localhost:27017/motegao --authenticationDatabase admin

# Redis
redis-cli -h localhost -p 6379 -a redis_password

# API
curl http://localhost:8000/docs

# App
open http://localhost:3000
```

### Rebuild Services

```bash
# Rebuild specific service
docker-compose up --build api
docker-compose up --build app

# Rebuild all services
docker-compose up --build

# Rebuild without cache
docker-compose up --build --no-cache
```

## Database Configuration

### MongoDB

In development, MongoDB credentials are:

- **URL**: `mongodb://admin:password@mongodb:27017/motegao?authSource=admin`
- **Username**: admin
- **Password**: password

For production, change via environment variables in `.env`:

```
MONGO_PASSWORD=your_secure_password
```

### Redis

In development, Redis authentication is:

- **URL**: `redis://:redis_password@redis:6379`
- **Password**: redis_password

For production, change via environment variables in `.env`:

```
REDIS_PASSWORD=your_secure_password
```

## Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

### API Service

- `APP_ENV`: `dev` or `prod` (default: dev)
- `PYTHONUNBUFFERED`: Set to `1` to avoid buffered output
- `MONGODB_URL`: MongoDB connection string
- `REDIS_URL`: Redis connection string

### App Service

- `NODE_ENV`: `development` or `production`
- `NEXT_PUBLIC_API_URL`: API endpoint URL (default: `http://localhost:8000`)

### Database Services

- `MONGO_PASSWORD`: MongoDB root password
- `REDIS_PASSWORD`: Redis password

## Troubleshooting

### MongoDB fails to start

```bash
# Check logs
docker-compose logs mongodb

# Verify port 27017 is not in use
lsof -i :27017

# Check volume
docker volume ls | grep mongodb
docker volume inspect motegao_mongodb_data
```

### Redis fails to start

```bash
# Check logs
docker-compose logs redis

# Verify port 6379 is not in use
lsof -i :6379

# Check volume
docker volume ls | grep redis
```

### API container fails to start

```bash
# Check logs
docker-compose logs api

# Verify port 8000 is not in use
lsof -i :8000

# Check dependencies are healthy
docker-compose ps
```

### App container fails to start

```bash
# Check logs
docker-compose logs app

# Verify port 3000 is not in use
lsof -i :3000

# Rebuild without cache
docker-compose up --build --no-cache app
```

### Database connectivity issues

```bash
# Test MongoDB from API container
docker-compose exec api mongosh mongodb://admin:password@mongodb:27017/motegao --authenticationDatabase admin --eval "db.adminCommand('ping')"

# Test Redis from API container
docker-compose exec api redis-cli -h redis -a redis_password ping
```

### Clear Docker resources

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (clears all data)
docker-compose down -v

# Remove unused images
docker image prune

# Remove all stopped containers
docker container prune

# Full cleanup (be careful!)
docker system prune -a
```

## Production Deployment

### Using Production Compose

```bash
# Start production stack
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

### Security Recommendations

1. **Change default passwords** before production deployment:

   ```bash
   cp .env.example .env
   # Edit .env with strong passwords
   docker-compose -f docker-compose.production.yml up -d
   ```

2. **Use environment file** with sensitive data:

   ```bash
   docker-compose -f docker-compose.production.yml --env-file .env.production up -d
   ```

3. **Enable MongoDB authentication** (already enabled in production config)

4. **Use Redis password protection** (already enabled in production config)

5. **Set up SSL/TLS** for external services

6. **Use restart policies** (already set to `always` in production config)

7. **Monitor logs and health checks**:
   ```bash
   docker-compose -f docker-compose.production.yml logs -f --tail=100
   ```

## Useful Commands

```bash
# Check service status
docker-compose ps

# Execute command in container
docker-compose exec api bash
docker-compose exec app bash
docker-compose exec mongodb mongosh

# View container resource usage
docker stats

# Inspect service configuration
docker-compose config

# Validate compose file
docker-compose config --quiet

# Scale services (not recommended with auto-reload volumes)
docker-compose up -d --scale api=2

# Update single service without rebuilding others
docker-compose up -d --no-deps --build api
```

## Integration with Your Application

### In your API code

Access database credentials from environment variables:

```python
from os import environ

MONGODB_URL = environ.get("MONGODB_URL", "mongodb://admin:password@mongodb:27017/motegao?authSource=admin")
REDIS_URL = environ.get("REDIS_URL", "redis://:redis_password@redis:6379")
```

### In your Frontend code

Access API URL:

```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
```

## File Structure

```
.
├── docker-compose.yml              # Development environment
├── docker-compose.production.yml    # Production environment
├── Dockerfile.api                   # API service image
├── Dockerfile.app                   # App service image
├── .dockerignore                    # Docker build optimization
├── .env.example                     # Environment variables template
└── DOCKER_SETUP.md                  # This file
```
