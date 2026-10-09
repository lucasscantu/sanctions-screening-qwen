# 🔧 Solução de Problemas Docker

## ❌ Erro: "unable to prepare context: unable to evaluate symlinks in Dockerfile path"

### Problema
Você está executando `docker-compose up -d` mas o Docker não encontra o Dockerfile.

### Solução

O projeto agora tem arquivos Docker na **raiz do projeto**:

```
UN-Sanctions-Screening-System/
├── docker-compose.yml      ← NOVO (na raiz)
├── Dockerfile              ← NOVO (na raiz)
├── nginx.conf              ← NOVO (na raiz)
└── .dockerignore           ← NOVO (na raiz)
```

### ✅ Passos para Resolver

#### 1. Navegue para a raiz do projeto
```bash
cd /home/lucas/Documentos/Projetos/UN-Sanctions-Screening-System
```

#### 2. Execute o docker-compose
```bash
docker-compose up -d
```

#### 3. Verifique se está rodando
```bash
docker-compose ps
```

#### 4. Acesse no navegador
```
http://localhost:3000
```

---

## 📋 Comandos Docker Completos

### Iniciar
```bash
docker-compose up -d
```

### Ver logs
```bash
docker-compose logs -f
```

### Parar
```bash
docker-compose down
```

### Reconstruir (após mudanças no código)
```bash
docker-compose up -d --build
```

### Limpar tudo
```bash
docker-compose down -v
docker system prune -a
```

---

## 🐛 Troubleshooting

### Erro: "Port 3000 already in use"

**Solução 1:** Use outra porta
```bash
# Edite docker-compose.yml
ports:
  - "8080:80"  # Mude para 8080 ou outra porta livre
```

**Solução 2:** Mate o processo na porta 3000
```bash
# Encontrar o processo
lsof -i :3000

# Matar o processo (substitua PID)
kill -9 <PID>
```

### Erro: "Cannot connect to the Docker daemon"

**Solução:** Inicie o Docker
```bash
# Linux
sudo systemctl start docker

# macOS
open -a Docker

# Windows
# Inicie o Docker Desktop
```

### Erro: "buildx Docker CLI plugin not found"

**Solução:** Use o builder clássico
```bash
# Edite docker-compose.yml e remova qualquer referência a buildx
# Ou use:
DOCKER_BUILDKIT=0 docker-compose up -d --build
```

### Erro: "The attribute `version` is obsolete"

**Solução:** Este é apenas um aviso, não um erro. O docker-compose funciona normalmente.

Para remover o aviso, o `docker-compose.yml` já foi atualizado sem o atributo `version`.

---

## 🔄 Alternativa: Executar sem Docker

Se preferir não usar Docker:

```bash
# 1. Instalar dependências
npm install

# 2. Executar em modo desenvolvimento
npm run dev

# 3. Acessar
# http://localhost:3000
```

---

## 📊 Verificar Status

### Containers rodando
```bash
docker-compose ps
```

### Uso de recursos
```bash
docker stats
```

### Logs em tempo real
```bash
docker-compose logs -f frontend
```

### Health check
```bash
curl http://localhost:3000/health
```

---

## 🗑️ Limpeza Completa

```bash
# Parar containers
docker-compose down

# Remover volumes
docker-compose down -v

# Remover imagens
docker rmi $(docker images -q sanctions-frontend)

# Limpar cache do Docker
docker system prune -a
```

---

## ✅ Verificação Final

Após executar `docker-compose up -d`, verifique:

```bash
# 1. Container está rodando
docker-compose ps
# Deve mostrar "Up" e "healthy"

# 2. Porta está listening
netstat -tlnp | grep 3000
# Ou
lsof -i :3000

# 3. Aplicação responde
curl http://localhost:3000
# Deve retornar HTML

# 4. Health check
curl http://localhost:3000/health
# Deve retornar "healthy"
```

---

## 📞 Ainda com problemas?

1. **Verifique os logs:**
   ```bash
   docker-compose logs frontend
   ```

2. **Reconstrua do zero:**
   ```bash
   docker-compose down -v
   docker system prune -a
   docker-compose up -d --build
   ```

3. **Consulte a documentação:**
   - [DOCKER.md](./DOCKER.md) - Guia completo Docker
   - [QUICKSTART.md](./QUICKSTART.md) - Guia rápido

---

**Pronto!** Agora você pode executar o projeto com Docker sem problemas. 🎉
