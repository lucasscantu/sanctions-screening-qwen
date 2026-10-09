# 📁 Sistema de Sanções com XML Local

Este sistema funciona com um arquivo XML local contendo a lista de sanções.

## 📂 Estrutura de Arquivos

```
UN-Sanctions-Screening-System/
├── public/
│   └── archives/
│       └── sanctions-list.xml    ← Arquivo XML com dados
├── src/
│   ├── lib/
│   │   └── xml-parser.ts        ← Parser do XML
│   ├── api/
│   │   └── client.ts            ← API que usa o XML
│   └── pages/
│       └── DataManager.tsx      ← Gerenciamento de dados
```

## 📄 Formato do Arquivo XML

O arquivo XML deve seguir esta estrutura:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sanctionsList>
  <!-- Indivíduos -->
  <individual id="REG-001" dateListed="2020-01-01" lastUpdate="2024-01-15">
    <primaryName>John Smith</primaryName>
    <alias quality="good">Johnny Smith</alias>
    <alias>John A. Smith</alias>
    <dateOfBirth precision="EXACT">1960-04-07</dateOfBirth>
    <placeOfBirth>London</placeOfBirth>
    <nationality>British</nationality>
    <gender>M</gender>
    <document type="Passport" number="D00012345" issuingCountry="UK"/>
    <address>London, UK</address>
    <program name="Program Alpha" reference="Financial regulations">
      Designated pursuant to resolution provisions
    </program>
  </individual>

  <!-- Entidades -->
  <entity id="REG-002" dateListed="2021-01-01" lastUpdate="2024-01-15">
    <primaryName>Company Ltd</primaryName>
    <alias quality="good">CL</alias>
    <address>Singapore</address>
    <program name="Program Beta" reference="Trade compliance">
      Listed for regulatory violations
    </program>
  </entity>
</sanctionsList>
```

## 🏷️ Elementos e Atributos

### `<individual>` - Pessoa Física
**Atributos:**
- `id` (obrigatório): Identificador único (ex: "REG-001")
- `dateListed` (opcional): Data de inclusão na lista
- `lastUpdate` (opcional): Data da última atualização

**Elementos filhos:**
- `<primaryName>` (obrigatório): Nome principal
- `<alias>` (opcional, múltiplo): Nomes alternativos
  - Atributo `quality` (opcional): "good", "low", etc.
- `<dateOfBirth>` (opcional): Data de nascimento
  - Atributo `precision`: "EXACT", "YEAR_ONLY", "APPROXIMATE"
- `<placeOfBirth>` (opcional): Local de nascimento
- `<nationality>` (opcional): Nacionalidade
- `<gender>` (opcional): "M" ou "F"
- `<document>` (opcional, múltiplo): Documentos de identificação
  - Atributos: `type`, `number`, `issuingCountry`
- `<address>` (opcional, múltiplo): Endereços
- `<program>` (opcional, múltiplo): Programas de sanção
  - Atributos: `name`, `reference`
  - Conteúdo: Detalhes da listagem

### `<entity>` - Pessoa Jurídica
**Atributos:**
- `id` (obrigatório): Identificador único
- `dateListed` (opcional): Data de inclusão
- `lastUpdate` (opcional): Data da última atualização

**Elementos filhos:**
- `<primaryName>` (obrigatório): Nome principal
- `<alias>` (opcional, múltiplo): Nomes alternativos
- `<address>` (opcional, múltiplo): Endereços
- `<program>` (opcional, múltiplo): Programas de sanção

## 🔄 Como Usar

### 1. Editar o Arquivo XML

O arquivo padrão está em:
```
public/archives/sanctions-list.xml
```

Edite este arquivo com seus dados ou substitua por um arquivo XML oficial da ONU.

### 2. Recarregar os Dados

Após editar o arquivo XML:

1. Acesse a página **"Data"** no menu
2. Clique em **"Recarregar Dados"**
3. O sistema irá重新 processar o XML

### 3. Fazer Buscas

1. Acesse a página **"Search"**
2. Digite um nome para buscar
3. O sistema buscará no XML carregado

## 📊 Estatísticas

O Dashboard mostra:
- Total de registros carregados
- Número de indivíduos
- Número de entidades
- Data da última sincronização

## 🔍 Exemplos de Busca

Com o XML de exemplo, tente buscar:

- `John` → Encontra "John Alexander Smith"
- `Maria` → Encontra "Maria Elena Rodriguez"
- `Zhang` → Encontra "Chen Wei Zhang"
- `Global` → Encontra "Global Trading Corporation"
- `Ahmed` → Encontra "Ahmed Hassan Ibrahim"

## ⚙️ Funcionamento Interno

1. **Carregamento**: O XML é carregado via `fetch('/archives/sanctions-list.xml')`
2. **Parsing**: O `xml-parser.ts` converte XML em objetos TypeScript
3. **Cache**: Os dados são mantidos em cache para performance
4. **Busca**: O `client.ts` usa os dados em cache para buscas
5. **Similaridade**: Algoritmos calculam scores de similaridade

## 🛡️ Segurança

- ✅ Todos os dados são processados localmente
- ✅ Nenhum dado é enviado para servidores externos
- ✅ XML é validado antes do processamento
- ✅ Parser seguro contra XXE (XML External Entity)

## 📝 Validação

O sistema valida:
- XML bem formado
- Estrutura esperada
- Campos obrigatórios
- Tipos de dados

## 🔄 Atualizando Dados

### Opção 1: Editar o Arquivo
```bash
# Edite diretamente
nano public/archives/sanctions-list.xml

# Ou use seu editor favorito
code public/archives/sanctions-list.xml
```

### Opção 2: Substituir o Arquivo
```bash
# Copie um novo arquivo XML
cp meu-novo-arquivo.xml public/archives/sanctions-list.xml
```

### Opção 3: Upload via Interface
1. Acesse a página **"Data"**
2. Clique em **"Selecionar Arquivo XML"**
3. Escolha seu arquivo
4. Clique em **"Recarregar Dados"**

## 🐛 Troubleshooting

### XML não carrega
- Verifique se o arquivo está em `public/archives/`
- Verifique se o nome é `sanctions-list.xml`
- Verifique se o XML é válido (use um validador online)

### Dados não atualizam
- Limpe o cache do navegador (Ctrl+Shift+R)
- Clique em "Recarregar Dados" na página Data
- Verifique o console do navegador para erros

### Busca não encontra resultados
- Verifique se o XML foi carregado corretamente
- Verifique a ortografia do nome
- Tente buscar por parte do nome
- Reduza o score mínimo na busca

## 📚 Recursos

- [Documentação XML](https://developer.mozilla.org/en-US/docs/Web/XML/XML_introduction)
- [DOMParser API](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser)
- [XPath](https://developer.mozilla.org/en-US/docs/Web/XPath)

## ⚠️ Notas Importantes

1. **Dados de Demonstração**: O XML incluído contém dados fictícios para teste
2. **Dados Reais**: Para uso em produção, substitua por dados oficiais da ONU
3. **Privacidade**: Todos os dados são processados localmente
4. **Performance**: O XML é carregado uma vez e mantido em cache

---

**Pronto para usar!** 🎉

Edite o arquivo `public/archives/sanctions-list.xml` com seus dados e comece a usar o sistema.
