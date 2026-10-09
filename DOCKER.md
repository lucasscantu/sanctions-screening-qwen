# 🐳 Docker - UN Sanctions Screening System

Este documento contém instruções para executar o sistema usando Docker.

## 📋 Pré-requisitos

- Docker Engine 20.10+
- Docker Compose 2.0+

Verifique a instalação:
```bash
docker --version
docker-compose --version
```

## 🚀 Início Rápido

### 1. Construir e iniciar o container

```bash
docker-compose up -d --build
```

### 2. Verificar se está rodando

```bash
docker-compose ps
```

### 3. Acessar a aplicação

Abra no navegador: **http://localhost:3000**

### 4. Ver logs

```bash
docker-compose logs -f frontend
```

### 5. Parar o container

```bash
docker-compose down
```

## 📦 Comandos Úteis

### Reconstruir após mudanças no código
```bash
docker-compose up -d --build
```

### Parar e remover volumes
```bash
docker-compose down -v
```

### Executar comandos dentro do container
```bash
docker-compose exec frontend sh
```

### Ver uso de recursos
```bash
docker stats sanctions-frontend
```

## 🔧 Configuração

### Alterar a porta

Edite o `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Mude 8080 para a porta desejada
```

### Variáveis de ambiente

Crie um arquivo `.env` na raiz:
```env
VITE_API_URL=http://localhost:8080
VITE_APP_TITLE=UN Sanctions Screening
```

## 🏗️ Arquitetura

```
┌─────────────────┐
│   Nginx (80)    │
│   ┌───────────┐ │
│   │  React    │ │
│   │   App     │ │
│   └───────────┘ │
└─────────────────┘
         ↓
    localhost:3000
```

## 🐛 Troubleshooting

### Porta 3000 já em uso
```bash
# Verificar qual processo está usando
lsof -i :3000

# Ou use outra porta no docker-compose.yml
ports:
  - "8080:80"
```

### Container não inicia
```bash
# Ver logs detalhados
docker-compose logs frontend

# Reconstruir do zero
docker-compose down
docker-compose up -d --build
```

### Build falhando
```bash
# Limpar cache do Docker
docker system prune -a

# Reconstruir
docker-compose up -d --build
```

### Aplicação não carrega
```bash
# Verificar se o container está saudável
docker-compose ps

# Verificar logs do nginx
docker-compose exec frontend cat /var/log/nginx/error.log
```

## 🔄 Atualizações

### Atualizar código e reconstruir
```bash
git pull
docker-compose up -d --build
```

### Atualizar apenas dependências
```bash
docker-compose exec frontend npm install
docker-compose restart frontend
```

## 📊 Monitoramento

### Health check
```bash
curl http://localhost:3000/health
```

### Estatísticas do container
```bash
docker stats sanctions-frontend
```

## 🗑️ Limpeza

### Remover tudo (containers, images, volumes)
```bash
docker-compose down -v --rmi all
docker system prune -a
```

### Remover apenas containers
```bash
docker-compose down
```

## 📝 Notas Importantes

1. **Modo Local**: Esta aplicação roda 100% localmente. Nenhum dado é enviado para servidores externos.

2. **Dados de Demonstração**: A aplicação usa dados fictícios para demonstração. Para usar dados reais, integre com o backend Java.

3. **Persistência**: Os dados não são persistidos entre reinicializações do container. Para persistência, configure volumes.

4. **Produção**: Para produção, considere:
   - Configurar HTTPS
   - Adicionar autenticação
   - Configurar backup de dados
   - Monitoramento e logs centralizados

## 🔗 Links Úteis

- [Documentação Docker](https://docs.docker.com/)
- [Documentação Docker Compose](https://docs.docker.com/compose/)
- [Documentação Nginx](https://nginx.org/en/docs/)

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs: `docker-compose logs -f`
2. Consulte a seção de Troubleshooting acima
3. Verifique se atende aos pré-requisitos
4. Abra uma issue no repositório

---

**Versão**: 1.0  
**Última atualização**: 2024
