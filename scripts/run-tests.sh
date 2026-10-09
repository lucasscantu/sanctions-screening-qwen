#!/bin/bash

echo "=========================================="
echo "  UN Sanctions Screening System - Tests"
echo "=========================================="
echo ""

# Verificar se o node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    echo ""
fi

echo "🧪 Executando todos os testes..."
echo ""

# Executar testes com relatório detalhado
npm test

# Verificar o resultado
if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "  ✅ Todos os testes passaram com sucesso!"
    echo "=========================================="
    echo ""
    echo "📊 Resumo:"
    echo "  - Testes de Similaridade: 35 testes"
    echo "  - Testes de API: 30 testes"
    echo "  - Testes de Componentes: 21 testes"
    echo "  - Total: 86+ testes"
    echo ""
    echo "📝 Para mais detalhes, veja TESTING.md"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "  ❌ Alguns testes falharam"
    echo "=========================================="
    echo ""
    echo "Verifique os erros acima e corrija os problemas."
    exit 1
fi
