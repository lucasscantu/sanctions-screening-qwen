# 🚀 Guia Rápido - UN Sanctions Screening System

## ⚡ Início Rápido (3 passos)

### 1️⃣ Instalar dependências
```bash
npm install
```

### 2️⃣ Executar em modo desenvolvimento
```bash
npm run dev
```

### 3️⃣ Abrir no navegador
Acesse: **http://localhost:3000**

---

## 🐳 Usando Docker

### Iniciar com Docker
```bash
docker-compose up -d
```

### Acessar
Abra: **http://localhost:3000**

### Parar
```bash
docker-compose down
```

---

## 🧪 Executar Testes

```bash
# Todos os testes
npm test

# Modo watch
npm run test:watch

# Com cobertura
npm run test:coverage
```

---

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos serão gerados em `dist/`

---

## 📁 Estrutura do Projeto

```
UN-Sanctions-Screening-System/
├── src/                    # Código fonte React
│   ├── api/               # Cliente API e dados mock
│   ├── components/        # Componentes reutilizáveis
│   ├── pages/             # Páginas da aplicação
│   ├── lib/               # Lógica de similaridade
│   ├── types/             # Tipos TypeScript
│   └── test/              # Testes automatizados
├── backend/               # Backend Java (incompleto)
├── docker-compose.yml     # Configuração Docker
├── package.json           # Dependências
└── README.md              # Documentação principal
```

---

## 🎯 Funcionalidades

✅ **Dashboard** - Visão geral do sistema  
✅ **Busca** - Screening de nomes com IA local  
✅ **Detalhes** - Informações completas de registros  
✅ **Administração** - Gerenciamento de sincronização  

---

## 🔍 Testar a Busca

Experimente buscar por:
- `John` - Múltiplas correspondências
- `Mohammed` - Variantes de transliteração
- `Zhang Wei` - Nomes em ordem diferente
- `Global Trading` - Entidades

---

## 📚 Documentação Completa

- [README.md](./README.md) - Documentação principal
- [TESTING.md](./TESTING.md) - Guia de testes
- [DOCKER.md](./DOCKER.md) - Guia Docker
- [TEST_REPORT.md](./TEST_REPORT.md) - Relatório de testes

---

## ⚙️ Requisitos

- Node.js 18+ 
- npm 9+
- Docker 20.10+ (opcional)

---

## 🆘 Problemas Comuns

### Porta 3000 em uso
```bash
# Use outra porta
npm run dev -- --port 3001
```

### Dependências desatualizadas
```bash
rm -rf node_modules package-lock.json
npm install
```

### Docker não funciona
```bash
# Reconstruir do zero
docker-compose down
docker-compose up -d --build
```

---

## 📞 Suporte

1. Verifique os logs: `npm run dev` ou `docker-compose logs`
2. Consulte a documentação em `DOCKER.md` ou `TESTING.md`
3. Verifique se atende aos requisitos

---

**Pronto para usar!** 🎉

Acesse http://localhost:3000 e comece a testar o sistema de screening.
