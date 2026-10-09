# Docker - Name Matching System

This document contains instructions for running the system using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

Verify installation:
```bash
docker --version
docker-compose --version
```

## Quick Start

### 1. Build and start the container

```bash
docker-compose up -d --build
```

### 2. Verify it is running

```bash
docker-compose ps
```

### 3. Access the application

Open in browser: **http://localhost:3000**

### 4. View logs

```bash
docker-compose logs -f frontend
```

### 5. Stop the container

```bash
docker-compose down
```

## Useful Commands

### Rebuild after code changes
```bash
docker-compose up -d --build
```

### Stop and remove volumes
```bash
docker-compose down -v
```

### Run commands inside the container
```bash
docker-compose exec frontend sh
```

### View resource usage
```bash
docker stats frontend
```

## Configuration

### Change the port

Edit `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Change 8080 to desired port
```

### Environment variables

Create a `.env` file at root:
```env
VITE_API_URL=http://localhost:8080
VITE_APP_TITLE=Name Matching System
```

## Architecture

```
+-----------------+
|   Nginx (80)    |
|   +-----------+ |
|   |  React    | |
|   |   App     | |
|   +-----------+ |
+-----------------+
         |
    localhost:3000
```

## Troubleshooting

### Port 3000 already in use
```bash
# Check which process is using it
lsof -i :3000

# Or use another port in docker-compose.yml
ports:
  - "8080:80"
```

### Container does not start
```bash
# View detailed logs
docker-compose logs frontend

# Rebuild from scratch
docker-compose down
docker-compose up -d --build
```

### Build failing
```bash
# Clear Docker cache
docker system prune -a

# Rebuild
docker-compose up -d --build
```

### Application does not load
```bash
# Check if container is healthy
docker-compose ps

# Check nginx logs
docker-compose exec frontend cat /var/log/nginx/error.log
```

## Updates

### Update code and rebuild
```bash
git pull
docker-compose up -d --build
```

### Update only dependencies
```bash
docker-compose exec frontend npm install
docker-compose restart frontend
```

## Monitoring

### Health check
```bash
curl http://localhost:3000/health
```

### Container statistics
```bash
docker stats frontend
```

## Cleanup

### Remove everything (containers, images, volumes)
```bash
docker-compose down -v --rmi all
docker system prune -a
```

### Remove only containers
```bash
docker-compose down
```

## Important Notes

1. **Local Mode**: This application runs 100% locally. No data is sent to external servers.

2. **Demo Data**: The application uses sample data for demonstration. To use real data, integrate with the Java backend.

3. **Persistence**: Data is not persisted between container restarts. For persistence, configure volumes.

4. **Production**: For production, consider:
   - Configure HTTPS
   - Add authentication
   - Configure data backup
   - Centralized monitoring and logs

## Useful Links

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)

## Support

If you encounter issues:
1. Check logs: `docker-compose logs -f`
2. Consult the Troubleshooting section above
3. Verify prerequisites are met
4. Open an issue in the repository

---

**Version**: 1.0
**Last updated**: December 2024
