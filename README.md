# 🛡️ UN Sanctions Screening System

Sistema de screening de sanções da ONU com IA local para análise de similaridade de nomes.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Tests](https://img.shields.io/badge/tests-86%2B-passing-brightgreen)

## 📋 Sobre

Sistema web completo para screening de indivíduos e entidades contra a Lista Consolidada de Sanções do Conselho de Segurança da ONU. Utiliza algoritmos determinísticos de similaridade e análise linguística com IA local (Ollama) para identificar correspondências potenciais.

### ✨ Características Principais

- 🔍 **Busca Inteligente** - 4 algoritmos de similaridade + análise de IA
- 🌐 **100% Local** - Processamento local, sem envio de dados externos
- 🎯 **Alta Precisão** - Levenshtein, Jaro-Winkler, Token-based, Bigram
- 🤖 **IA Local** - Análise linguística com Ollama (opcional)
- 📊 **Dashboard** - Métricas e status do sistema
- 🔐 **Seguro** - Dados sensíveis não saem da sua máquina
- 🧪 **Testado** - 86+ testes automatizados
- 🐳 **Docker** - Fácil deploy com containers

## 🚀 Início Rápido

### Opção 1: Node.js (Recomendado para desenvolvimento)

```bash
# 1. Instalar dependências
npm install

# 2. Executar em modo desenvolvimento
npm run dev

# 3. Abrir no navegador
# http://localhost:3000
```

### Opção 2: Docker

```bash
# 1. Construir e iniciar
docker-compose up -d

# 2. Abrir no navegador
# http://localhost:3000

# 3. Parar quando terminar
docker-compose down
```

## 📖 Documentação

| Documento | Descrição |
|-----------|-----------|
| [QUICKSTART.md](./QUICKSTART.md) | Guia rápido de início |
| [DOCKER.md](./DOCKER.md) | Guia completo Docker |
| [TESTING.md](./TESTING.md) | Guia de testes |
| [TEST_REPORT.md](./TEST_REPORT.md) | Relatório detalhado de testes |

## 🎯 Funcionalidades

### 📊 Dashboard
- Total de registros (indivíduos e entidades)
- Status de sincronização
- Status do modelo de IA (Ollama)
- Falhas recentes

### 🔍 Busca de Sanções
- Busca por nome completo ou parcial
- Filtros por tipo (Indivíduo/Entidade)
- Score mínimo configurável
- Paginação de resultados
- Análise de IA para cada correspondência

### 📋 Detalhes do Registro
- Nome principal e aliases
- Informações biográficas
- Documentos de identificação
- Programas de sanções
- Metadados de sincronização

### ⚙️ Administração
- Sincronização manual
- Histórico de importações
- Configuração do Ollama
- Status do sistema

## 🧠 Algoritmos de Similaridade

O sistema utiliza 4 algoritmos determinísticos:

1. **Levenshtein** - Distância de edição entre strings
2. **Jaro-Winkler** - Similaridade com bônus para prefixos comuns
3. **Token-based** - Comparação independente de ordem
4. **Bigram** - Coeficiente Dice de bigramas

### Exemplos de Correspondência

```typescript
// Transliterações árabes
'Mohamed' ↔ 'Mohammed' → 85%
'Mohamed' ↔ 'Muhammad' → 78%
'Ahmed' ↔ 'Ahmad' → 82%

// Ordem de nomes (chinês)
'Zhang Wei' ↔ 'Wei Zhang' → 100%

// Acentos e diacríticos
'José' ↔ 'Jose' → 100%
'François' ↔ 'Francois' → 100%

// Sobrenomes compostos
'Garcia Lopez' ↔ 'García-López' → 92%
```

## 🤖 Integração com IA (Ollama)

O sistema pode usar Ollama para análise linguística avançada:

### Instalação do Ollama

```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Baixar modelo
ollama pull qwen3:4b
```

### Configuração

O sistema detecta automaticamente o Ollama em `http://localhost:11434`

### Análise de IA

Para cada correspondência, a IA fornece:
- Explicação linguística
- Campos de suporte
- Campos conflitantes
- Informações ausentes
- Avaliação qualitativa (HIGH/MEDIUM/LOW/INDETERMINATE)

## 🏗️ Arquitetura

```
┌─────────────────────────────────────┐
│         Frontend (React)            │
│  ┌───────────────────────────────┐  │
│  │  Dashboard │ Search │ Admin   │  │
│  └───────────────────────────────┘  │
│         ↓                           │
│  ┌───────────────────────────────┐  │
│  │   Similarity Engine           │  │
│  │  - Levenshtein                │  │
│  │  - Jaro-Winkler               │  │
│  │  - Token-based                │  │
│  │  - Bigram                     │  │
│  └───────────────────────────────┘  │
│         ↓                           │
│  ┌───────────────────────────────┐  │
│  │   Ollama Integration          │  │
│  │   (Optional)                  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## 🧪 Testes

O projeto possui 86+ testes automatizados:

```bash
# Executar todos os testes
npm test

# Modo watch
npm run test:watch

# Com cobertura
npm run test:coverage
```

### Cobertura

- ✅ Motor de similaridade (35 testes)
- ✅ Cliente API (30 testes)
- ✅ Componentes React (21 testes)

Veja [TEST_REPORT.md](./TEST_REPORT.md) para detalhes completos.

## 📦 Build para Produção

```bash
# Build
npm run build

# Os arquivos estarão em dist/
ls dist/
```

## 🐳 Docker

### Comandos úteis

```bash
# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Reconstruir
docker-compose up -d --build
```

Veja [DOCKER.md](./DOCKER.md) para guia completo.

## 🔒 Segurança e Privacidade

- ✅ **100% Local** - Nenhum dado é enviado para servidores externos
- ✅ **Processamento Local** - IA roda na sua máquina
- ✅ **Sem Telemetria** - Nenhuma coleta de dados
- ✅ **Código Aberto** - Auditável e transparente

## ⚠️ Aviso Legal

**IMPORTANTE**: Este sistema é uma ferramenta de assistência para screening. 

- ❌ **NÃO** faz determinações legais definitivas
- ❌ **NÃO** confirma identidade automaticamente
- ✅ **REQUER** revisão humana qualificada
- ✅ **FORNECE** scores experimentais de similaridade

Os scores de similaridade são **experimentais** e devem ser validados por profissionais qualificados antes de qualquer decisão de compliance.

## 🛠️ Tecnologias

### Frontend
- React 18 + TypeScript
- Vite 6
- Tailwind CSS 4
- React Router 6
- TanStack Query
- React Hook Form + Zod
- Lucide React

### Backend (Planejado)
- Java 21
- Spring Boot 3.5.x
- PostgreSQL
- Flyway
- Spring Security

### IA
- Ollama
- Qwen3 4B (recomendado)

### Testes
- Vitest
- React Testing Library
- Testing Library User Event

## 📊 Dados

O sistema usa dados fictícios para demonstração. Para usar dados reais:

1. Baixe a lista oficial da ONU
2. Implemente o backend Java
3. Configure a importação de dados
4. Execute a sincronização

Fonte oficial: [UN Security Council Consolidated List](https://main.un.org/securitycouncil/en/content/un-sc-consolidated-list)

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](./LICENSE) para detalhes.

## 🆘 Suporte

### Problemas Comuns

**Porta 3000 em uso:**
```bash
npm run dev -- --port 3001
```

**Docker não funciona:**
```bash
docker-compose down
docker-compose up -d --build
```

**Testes falhando:**
```bash
rm -rf node_modules
npm install
npm test
```

### Documentação

- [QUICKSTART.md](./QUICKSTART.md) - Guia rápido
- [DOCKER.md](./DOCKER.md) - Guia Docker
- [TESTING.md](./TESTING.md) - Guia de testes
- [TEST_REPORT.md](./TEST_REPORT.md) - Relatório de testes

## 📈 Roadmap

- [ ] Backend Java completo
- [ ] Importação de dados reais da ONU
- [ ] Autenticação e autorização
- [ ] API REST completa
- [ ] Testes E2E
- [ ] Documentação OpenAPI/Swagger
- [ ] Suporte a múltiplos idiomas
- [ ] Exportação de relatórios

## 👥 Autores

Desenvolvido como projeto de demonstração de sistema de screening de sanções com IA local.

## 🙏 Agradecimentos

- United Nations Security Council - Dados oficiais
- Ollama - Infraestrutura de IA local
- Comunidade open-source

---

**Feito com ❤️ para compliance e segurança financeira**

⭐ Se este projeto foi útil, considere dar uma estrela!
