# Documentacao Tecnica - Sistema de Comparacao de Registros Textuais

## 1. Visao Geral

Aplicacao web em React e TypeScript para comparacao de registros textuais armazenados em arquivos XML. Opera localmente no navegador, sem transmissao de dados.

### Caracteristicas

- Processamento local no navegador
- Suporte a multiplos formatos XML
- Quatro algoritmos de similaridade
- Cache para otimizacao
- Interface responsiva
- 86 testes automatizados

---

## 2. Modulos Principais

### 2.1 Motor de Similaridade (`src/lib/similarity.ts`)

Implementa quatro algoritmos de comparacao de strings:

**Funcoes Exportadas:**

- `normalizeName(name: string): string` - Normaliza strings para comparacao
- `tokenize(name: string): string[]` - Divide string em tokens
- `levenshteinSimilarity(a: string, b: string): number` - Distancia de edicao
- `jaroWinklerSimilarity(a: string, b: string): number` - Similaridade com bonus de prefixo
- `tokenSimilarity(a: string, b: string): number` - Comparacao por tokens
- `bigramSimilarity(a: string, b: string): number` - Coeficiente Dice de bigramas
- `calculateSimilarity(search: string, candidate: string, aliases: string[]): number` - Funcao principal
- `getScoreLabel(score: number): string` - Classifica pontuacao

### 2.2 Parser XML (`src/lib/xml-parser.ts`)

Converte arquivos XML em objetos TypeScript.

**Classe `SanctionsXMLParser`:**

- `static parse(xmlContent: string): Record[]` - Parseia conteudo XML
- `static detectFormat(xmlContent: string): string` - Detecta formato
- `validateXML(xmlContent: string): boolean` - Valida XML

**Formatos Suportados:**

Formato A (tags em caixa alta):
```xml
<RECORD>
  <FIRST_NAME>JOHN</FIRST_NAME>
  <SECOND_NAME>SMITH</SECOND_NAME>
  <REFERENCE>REF-001</REFERENCE>
</RECORD>
```

Formato B (tags em caixa baixa):
```xml
<record id="REG-001">
  <name>John Smith</name>
  <alias>Johnny</alias>
</record>
```

### 2.3 Cliente API (`src/api/client.ts`)

Gerencia dados e operacoes de busca.

**Funcoes Exportadas:**

- `searchRecords(name, type?, limit?, page?, minScore?): Promise<SearchResponse>`
- `getRecordById(id: number): Promise<Record | null>`
- `getDashboardStats(): Promise<DashboardStats>`
- `addUploadedRecords(records: Record[]): void`
- `parseXMLContent(xmlContent: string): Record[]`
- `clearUploadedRecords(): void`
- `clearRecordsCache(): void`

---

## 3. Algoritmos de Comparacao

### 3.1 Distancia de Levenshtein

Calcula numero minimo de operacoes de edicao (insercao, delecao, substituicao) para transformar uma string em outra.

**Formula:**
```
similaridade = ((maxLen - distancia) / maxLen) * 100
```

**Implementacao:**
```typescript
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= a.length; i++) matrix[i] = [i];
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}
```

**Casos de Uso:** Erros de digitacao, variacoes menores

### 3.2 Similaridade Jaro-Winkler

Extensao do algoritmo Jaro com bonus para prefixos comuns.

**Formula:**
```
jaro = (matches/lenA + matches/lenB + (matches - transpositions/2)/matches) / 3
similaridade = jaro + prefixo * 0.1 * (1 - jaro)
```

**Casos de Uso:** Nomes com prefixos compartilhados, transliteracoes

### 3.3 Similaridade Baseada em Tokens

Compara conjuntos de palavras independentemente da ordem.

**Formula:**
```
intersecao = tokensA ∩ tokensB
uniao = tokensA ∪ tokensB
similaridade = (intersecao / uniao) * 100
```

**Casos de Uso:** Ordem invertida, componentes em ordem diferente

### 3.4 Coeficiente Dice de Bigramas

Analisa pares de caracteres consecutivos.

**Formula:**
```
bigramasA = {str[0:2], str[1:3], str[2:4], ...}
bigramasB = {str[0:2], str[1:3], str[2:4], ...}
intersecao = bigramasA ∩ bigramasB
similaridade = (2 * intersecao / (|bigramasA| + |bigramasB|)) * 100
```

**Casos de Uso:** Variacoes foneticas, padroes de caracteres

### 3.5 Estrategia de Combinacao

Sistema utiliza maxima pontuacao entre os quatro algoritmos:

```typescript
finalScore = max(levenshtein, jaroWinkler, token, bigram)
```

**Justificativa:** Garante que pelo menos uma abordagem identifique correspondencia quando existir.

---

## 4. Processamento de XML

### 4.1 Deteccao de Formato

Parser detecta formato automaticamente:

```typescript
if (xmlContent.includes('<RECORD>')) {
  return 'FORMAT_A';
}
if (xmlContent.includes('<record>')) {
  return 'FORMAT_B';
}
```

### 4.2 Parsing de Formato A

**Estrutura:**
```xml
<DATAEXPORT>
  <RECORDS>
    <RECORD>
      <DATAID>12345</DATAID>
      <FIRST_NAME>JOHN</FIRST_NAME>
      <SECOND_NAME>SMITH</SECOND_NAME>
      <REFERENCE>REF-001</REFERENCE>
      <ALIAS>
        <QUALITY>Good</QUALITY>
        <NAME>Johnny</NAME>
      </ALIAS>
      <DATE_OF_BIRTH>
        <TYPE>EXACT</TYPE>
        <DATE>1970-01-01</DATE>
      </DATE_OF_BIRTH>
    </RECORD>
  </RECORDS>
</DATAEXPORT>
```

**Mapeamento:**
- `DATAID` → `referenceNumber`
- `FIRST_NAME` + `SECOND_NAME` → `primaryName`
- `ALIAS/NAME` → `aliases[]`
- `DATE_OF_BIRTH/DATE` → `biographicalDetails.dateOfBirth`

### 4.3 Parsing de Formato B

**Estrutura:**
```xml
<records>
  <record id="REG-001" dateListed="2020-01-01">
    <name>John Smith</name>
    <alias quality="good">Johnny</alias>
    <dateOfBirth precision="EXACT">1970-01-01</dateOfBirth>
  </record>
</records>
```

**Mapeamento:**
- `@id` → `referenceNumber`
- `<name>` → `primaryName`
- `<alias>` → `aliases[]`
- `<dateOfBirth>` → `biographicalDetails.dateOfBirth`

### 4.4 Validacao

Parser valida:
- XML bem formado
- Campos obrigatorios presentes
- Tipos de dados corretos

Arquivos invalidos sao rejeitados.

---

## 5. Interface Web

### 5.1 Dashboard (`/`)

**Componentes:**
- Cards de estatisticas
- Status do sistema
- Informacoes de sincronizacao

**Dados Exibidos:**
- Total de registros
- Numero de categorias
- Data da ultima atualizacao

### 5.2 Pagina de Busca (`/search`)

**Componentes:**
- Campo de entrada
- Filtros (tipo, pontuacao minima)
- Lista de resultados
- Paginacao

**Interacao:**
1. Usuario digita texto
2. Sistema valida (minimo 2 caracteres)
3. Resultados ordenados por pontuacao
4. Usuario pode ver detalhes

### 5.3 Pagina de Detalhes (`/records/:id`)

**Componentes:**
- Nome principal
- Lista de aliases
- Dados biográficos
- Documentos
- Metadados

### 5.4 Gerenciamento de Dados (`/data`)

**Componentes:**
- Area de upload
- Lista de arquivos carregados
- Estatisticas
- Botoes de acao

**Interacao:**
1. Usuario seleciona arquivo
2. Sistema processa
3. Estatisticas atualizadas

---

## 6. API Interna

### 6.1 Funcoes de Busca

#### `searchRecords(name, type?, limit?, page?, minScore?)`

**Parametros:**
- `name` (string, obrigatorio): Texto a buscar
- `type` (string, opcional): Filtrar por tipo
- `limit` (number, opcional): Resultados por pagina (padrao: 20)
- `page` (number, opcional): Numero da pagina (padrao: 1)
- `minScore` (number, opcional): Pontuacao minima 0-100 (padrao: 0)

**Retorno:**
```typescript
Promise<{
  query: string,
  totalResults: number,
  page: number,
  pageSize: number,
  results: SearchResult[],
  searchTimeMs: number
}>
```

**Exemplo:**
```typescript
const results = await searchRecords('John Smith', 'TYPE_A', 10, 1, 50);
```

### 6.2 Funcoes de Dados

#### `getRecordById(id)`

**Parametros:**
- `id` (number): ID do registro

**Retorno:**
```typescript
Promise<Record | null>
```

#### `getDashboardStats()`

**Retorno:**
```typescript
Promise<{
  totalRecords: number,
  totalTypeA: number,
  totalTypeB: number,
  lastUpdateTime: string | null
}>
```

### 6.3 Funcoes de Upload

#### `parseXMLContent(xmlContent)`

**Parametros:**
- `xmlContent` (string): Conteudo XML

**Retorno:**
```typescript
Record[]
```

#### `addUploadedRecords(records)`

**Parametros:**
- `records` (Record[]): Registros a adicionar

#### `clearUploadedRecords()`

Limpa todos os registros carregados.

### 6.4 Funcoes de Cache

#### `clearRecordsCache()`

Invalida cache forcando recarregamento.

---

## 7. Gerenciamento de Estado

### 7.1 Estrategia de Cache

Sistema utiliza cache em memoria:

```typescript
let cachedRecords: Record[] | null = null;
```

**Funcionamento:**
1. Primeira consulta carrega dados
2. Consultas subsequentes usam cache
3. Cache invalidado manualmente

### 7.2 Invalidacao de Cache

Cache invalidado em:
- Upload de novos arquivos
- Clique em "Recarregar"
- Clique em "Limpar"
- Recarregamento da pagina

### 7.3 Performance

**Tempos Medios:**
- Carregamento inicial: 50-200ms
- Busca em cache: 100-300ms
- Busca sem cache: 200-500ms

---

## 8. Testes

### 8.1 Estrutura

**Arquivos:**
- `src/test/similarity.test.ts` - 35 testes
- `src/test/api.test.ts` - 30 testes
- `src/test/Layout.test.tsx` - 6 testes
- `src/test/Dashboard.test.tsx` - 6 testes
- `src/test/SearchPage.test.tsx` - 9 testes

**Total:** 86 testes, 95% cobertura

### 8.2 Testes de Similaridade

**Cenarios:**
- Strings identicas (100%)
- Diferencas de case (100%)
- Diferencas de acentos (100%)
- Erros menores (>80%)
- Strings diferentes (<50%)
- Variacoes (>70%)
- Ordem invertida (100% com token)

**Exemplo:**
```typescript
it('should match variations', () => {
  const score = calculateSimilarity('John', 'Jon');
  expect(score).toBeGreaterThan(70);
});
```

### 8.3 Testes de API

**Cenarios:**
- Busca com query vazia
- Busca com query valida
- Filtros por tipo
- Filtros por pontuacao
- Paginacao
- Ordenacao

### 8.4 Testes de Componentes

**Cenarios:**
- Renderizacao correta
- Interacao do usuario
- Estados de carregamento
- Validacao de formularios

### 8.5 Executando Testes

```bash
# Todos os testes
npm test

# Modo watch
npm run test:watch

# Com cobertura
npm run test:coverage
```

---

## 9. Instalacao

### 9.1 Desenvolvimento

```bash
npm install
npm run dev
```

Acesse http://localhost:3000

### 9.2 Build para Producao

```bash
npm run build
```

Arquivos em `dist/`

### 9.3 Docker

**Build:**
```bash
docker-compose up -d --build
```

**Acessar:**
http://localhost:3000

**Parar:**
```bash
docker-compose down
```

### 9.4 Estrutura de Diretorios

```
projeto/
├── public/
│   └── archives/
│       └── manifest.json
├── src/
│   ├── api/
│   │   └── client.ts
│   ├── components/
│   │   └── Layout.tsx
│   ├── lib/
│   │   ├── similarity.ts
│   │   └── xml-parser.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── SearchPage.tsx
│   │   ├── RecordDetails.tsx
│   │   ├── DataManager.tsx
│   │   └── AdminPage.tsx
│   ├── test/
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── docker-compose.yml
├── Dockerfile
├── package.json
└── README.md
```

---

## 10. Referencias

LEVENSTEIN, V. I. Binary codes capable of correcting deletions, insertions, and reversals. Soviet Physics Doklady, v. 10, n. 8, p. 707-710, 1965.

JARO, M. A. Advances in record-linkage methodology. Journal of the American Statistical Association, v. 84, n. 406, p. 414-423, 1989.

WINKLER, W. E. The state of record linkage and current research problems. U.S. Bureau of the Census, 1999.

---

**Versao:** 1.0.0  
**Ultima Atualizacao:** Dezembro 2024
