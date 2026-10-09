# Troubleshooting Docker

## Error: "unable to prepare context: unable to evaluate symlinks in Dockerfile path"

### Problem
You are running `docker-compose up -d` but Docker cannot find the Dockerfile.

### Solution

The project now has Docker files at the **project root**:

```
name-matching-system/
+-- docker-compose.yml      (at root)
+-- Dockerfile              (at root)
+-- nginx.conf              (at root)
+-- .dockerignore           (at root)
```

### Steps to Resolve

#### 1. Navigate to project root
```bash
cd /path/to/name-matching-system
```

#### 2. Run docker-compose
```bash
docker-compose up -d
```

#### 3. Verify it is running
```bash
docker-compose ps
```

#### 4. Access in browser
```
http://localhost:3000
```

---

## Complete Docker Commands

### Start
```bash
docker-compose up -d
```

### View logs
```bash
docker-compose logs -f
```

### Stop
```bash
docker-compose down
```

### Rebuild (after code changes)
```bash
docker-compose up -d --build
```

### Clean everything
```bash
docker-compose down -v
docker system prune -a
```

---

## Troubleshooting

### Error: "Port 3000 already in use"

**Solution 1:** Use another port
```bash
# Edit docker-compose.yml
ports:
  - "8080:80"  # Change to 8080 or another free port
```

**Solution 2:** Kill the process on port 3000
```bash
# Find the process
lsof -i :3000

# Kill the process (replace PID)
kill -9 <PID>
```

### Error: "Cannot connect to the Docker daemon"

**Solution:** Start Docker
```bash
# Linux
sudo systemctl start docker

# macOS
open -a Docker

# Windows
# Start Docker Desktop
```

### Error: "buildx Docker CLI plugin not found"

**Solution:** Use classic builder
```bash
# Edit docker-compose.yml and remove any buildx references
# Or use:
DOCKER_BUILDKIT=0 docker-compose up -d --build
```

### Error: "The attribute `version` is obsolete"

**Solution:** This is just a warning, not an error. The docker-compose works normally.

To remove the warning, the `docker-compose.yml` has already been updated without the `version` attribute.

---

## Alternative: Run without Docker

If you prefer not to use Docker:

```bash
# 1. Install dependencies
npm install

# 2. Run in development mode
npm run dev

# 3. Access
# http://localhost:3000
```

---

## Check Status

### Running containers
```bash
docker-compose ps
```

### Resource usage
```bash
docker stats
```

### Real-time logs
```bash
docker-compose logs -f frontend
```

### Health check
```bash
curl http://localhost:3000/health
```

---

## Complete Cleanup

```bash
# Stop containers
docker-compose down

# Remove volumes
docker-compose down -v

# Remove images
docker rmi $(docker images -q frontend)

# Clear Docker cache
docker system prune -a
```

---

## Final Verification

After running `docker-compose up -d`, verify:

```bash
# 1. Container is running
docker-compose ps
# Should show "Up" and "healthy"

# 2. Port is listening
netstat -tlnp | grep 3000
# Or
lsof -i :3000

# 3. Application responds
curl http://localhost:3000
# Should return HTML

# 4. Health check
curl http://localhost:3000/health
# Should return "healthy"
```

---

## Still having problems?

1. **Check logs:**
   ```bash
   docker-compose logs frontend
   ```

2. **Rebuild from scratch:**
   ```bash
   docker-compose down -v
   docker system prune -a
   docker-compose up -d --build
   ```

3. **Consult documentation:**
   - [DOCKER.md](./DOCKER.md) - Complete Docker guide
   - [QUICKSTART.md](./QUICKSTART.md) - Quick start guide

---

**Ready!** Now you can run the project with Docker without issues.
