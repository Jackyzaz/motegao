# Motegao

A distributed security reconnaissance platform that visualizes attack surface discovery through an interactive graph-based interface.

<img width="1920" height="1100" alt="Screenshot From 2026-02-09 20-16-03" src="https://github.com/user-attachments/assets/dd3d360d-161d-493f-922a-e5cf681b35d3" />

## 🎯 What is Motegao?

Motegao is a scalable web application designed for security professionals to perform automated reconnaissance on target domains. It provides a visual, node-based workflow where you can execute multiple security scanning tools and see results in real-time on an interactive canvas.

### Key Features

- **🔍 Multi-Tool Reconnaissance**
  - Subdomain enumeration with customizable wordlists
  - Port scanning with Nmap integration
  - Directory/path discovery (gobuster)
- **📊 Visual Workflow**
  - Interactive canvas for managing domains and scan results
  - Real-time task progress tracking
  - Graph-based visualization of discovered assets

- **⚡ Distributed Architecture**
  - Celery workers powered by Google Cloud Pub/Sub
  - Horizontal scaling across 3+ worker nodes
  - Concurrent task execution for faster reconnaissance

- **💾 Project Management**
  - Save and resume scanning sessions
  - MongoDB-backed persistence
  - User authentication with Google OAuth

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│  Next.js    │────▶│  FastAPI    │────▶│ GCP Pub/Sub  │
│  Frontend   │     │  Backend    │     │              │
└─────────────┘     └─────────────┘     └──────┬───────┘
                                               │
                    ┌──────────────────────────┘
                    │
         ┌──────────▼──────────┐
         │  Celery Workers     │
         │  (10.148.0.5-58)    │
         │  - nmap             │
         │  - gobuster         │
         │  - DNS enumeration  │
         └─────────────────────┘
```

### Tech Stack

**Frontend:**

- Next.js 15 with App Router
- React Flow for graph visualization
- NextAuth.js for authentication
- TailwindCSS for styling

**Backend:**

- FastAPI (Python)
- Celery for distributed task queue
- MongoDB for data persistence
- Redis for caching
- GCP Pub/Sub as message broker

**Infrastructure:**

- Docker & Docker Compose
- Kubernetes support
- Nginx reverse proxy
- Let's Encrypt SSL
- GitHub Actions CI/CD

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Google Cloud account (for Pub/Sub)
- Node.js 18+ (for local development)
- Python 3.13+ (for local development)

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/motegao.git
   cd motegao
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start services with Docker Compose**

   ```bash
   docker compose -f docker-compose.production.yml up -d
   ```

4. **Access the application**
   - Frontend: http://localhost
   - API Docs: http://localhost/docs
   - Backend: http://localhost/api

### Production Deployment

See [DOCKER_PRODUCTION.md](DOCKER_PRODUCTION.md) for detailed production setup.

For SSL/HTTPS deployment:

```bash
docker compose -f docker-compose.ssl.yml up -d
```

## 📖 Usage

1. **Login** with your Google account
2. **Create a new project** from the dashboard
3. **Add a target domain** using the domain modal
4. **Select a domain** by clicking on it in the canvas
5. **Enable scanning tools** from the Tools panel
6. **Configure and run** scans with custom parameters
7. **View results** in real-time on the canvas
8. **Save your project** to resume later

## 🔧 Configuration

### Environment Variables

Key variables in `.env.production`:

- `GOOGLE_APPLICATION_CREDENTIALS` - Path to GCP service account JSON
- `CELERY_BROKER_URL` - GCP Pub/Sub connection
- `CELERY_BACKEND_URL` - GCS bucket for results
- `MONGO_ROOT_PASSWORD` - MongoDB admin password
- `SECRET_KEY` - FastAPI secret key
- `NEXTAUTH_SECRET` - NextAuth.js secret
- `SSL_DOMAIN` - Your domain for SSL certificates

### Worker Scaling

Workers are defined in the GitHub Actions workflow. Edit [.github/workflows/deploy-production.yml](.github/workflows/deploy-production.yml) and set the `WORKER_IPS` environment variable.

## 📁 Project Structure

```
motegao/
├── app/                    # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities & controllers
│   └── Dockerfile
├── motegao/               # FastAPI backend
│   ├── api/              # API routes
│   ├── celery/           # Celery app & tasks
│   ├── models/           # Database models
│   └── schemas/          # Pydantic schemas
├── k8s/                  # Kubernetes manifests
├── scripts/              # Utility scripts
├── wordlists/            # Scanning wordlists
└── docker-compose.*.yml  # Docker compositions
```

## 📝 License

This project is for educational and authorized security testing purposes only. Users are responsible for ensuring they have proper authorization before scanning any systems.

## 🙏 Acknowledgments

- [Nmap](https://nmap.org/) - Network scanning
- [Gobuster](https://github.com/OJ/gobuster) - Directory enumeration
- [React Flow](https://reactflow.dev/) - Graph visualization
- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [Celery](https://docs.celeryq.dev/) - Distributed task queue
