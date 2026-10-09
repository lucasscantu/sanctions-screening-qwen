# Technical Documentation - Textual Record Comparison System

## 1. Overview

Web application in React and TypeScript for comparing textual records stored in XML files. Operates locally in the browser, without data transmission.

### Features

- Local processing in browser
- Support for multiple XML formats
- Four similarity algorithms
- Cache for optimization
- Responsive interface
- 86 automated tests

---

## 2. Main Modules

### 2.1 Similarity Engine (`src/lib/similarity.ts`)

Implements four string comparison algorithms:

**Exported Functions:**

- `normalizeName(name: string): string` - Normalizes strings for comparison
- `tokenize(name: string): string[]` - Splits string into tokens
- `levenshteinSimilarity(a: string, b: string): number` - Edit distance
- `jaroWinklerSimilarity(a: string, b: string): number` - Similarity with prefix bonus
- `tokenSimilarity(a: string, b: string): number` - Token comparison
- `bigramSimilarity(a: string, b: string): number` - Bigram Dice coefficient
- `calculateSimilarity(search: string, candidate: string, aliases: string[]): number` - Main function
- `getScoreLabel(score: number): string` - Classifies score

### 2.2 XML Parser (`src/lib/xml-parser.ts`)

Converts XML files to TypeScript objects.

**Class `XMLParser`:**

- `static parse(xmlContent: string): Record[]` - Parses XML content
- `static detectFormat(xmlContent: string): string` - Detects format
- `validateXML(xmlContent: string): boolean` - Validates XML

**Supported Formats:**

Format A (uppercase tags):
```xml
<RECORD>
  <FIRST_NAME>JOHN</FIRST_NAME>
  <SECOND_NAME>SMITH</SECOND_NAME>
  <REFERENCE>REF-001</REFERENCE>
</RECORD>
```

Format B (lowercase tags):
```xml
<record id="REG-001">
  <name>John Smith</name>
  <alias>Johnny</alias>
</record>
```

### 2.3 API Client (`src/api/client.ts`)

Manages data and search operations.

**Exported Functions:**

- `searchRecords(name, type?, limit?, page?, minScore?): Promise<SearchResponse>`
- `getRecordById(id: number): Promise<Record | null>`
- `getDashboardStats(): Promise<DashboardStats>`
- `addUploadedRecords(records: Record[]): void`
- `parseXMLContent(xmlContent: string): Record[]`
- `clearUploadedRecords(): void`
- `clearRecordsCache(): void`

---

## 3. Comparison Algorithms

### 3.1 Levenshtein Distance

Calculates minimum number of edit operations (insertion, deletion, substitution) to transform one string into another.

**Formula:**
```
similarity = ((maxLen - distance) / maxLen) * 100
```

**Implementation:**
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

**Use Cases:** Typos, minor variations

### 3.2 Jaro-Winkler Similarity

Extension of Jaro algorithm with bonus for common prefixes.

**Formula:**
```
jaro = (matches/lenA + matches/lenB + (matches - transpositions/2)/matches) / 3
similarity = jaro + prefix * 0.1 * (1 - jaro)
```

**Use Cases:** Names with shared prefixes, transliterations

### 3.3 Token-Based Similarity

Compares word sets regardless of order.

**Formula:**
```
intersection = tokensA ∩ tokensB
union = tokensA ∪ tokensB
similarity = (intersection / union) * 100
```

**Use Cases:** Reversed order, components in different order

### 3.4 Bigram Dice Coefficient

Analyzes consecutive character pairs.

**Formula:**
```
bigramsA = {str[0:2], str[1:3], str[2:4], ...}
bigramsB = {str[0:2], str[1:3], str[2:4], ...}
intersection = bigramsA ∩ bigramsB
similarity = (2 * intersection / (|bigramsA| + |bigramsB|)) * 100
```

**Use Cases:** Phonetic variations, character patterns

### 3.5 Combination Strategy

System uses maximum score among four algorithms:

```typescript
finalScore = max(levenshtein, jaroWinkler, token, bigram)
```

**Justification:** Ensures at least one approach identifies match when it exists.

---

## 4. XML Processing

### 4.1 Format Detection

Parser automatically detects format:

```typescript
if (xmlContent.includes('<RECORD>')) {
  return 'FORMAT_A';
}
if (xmlContent.includes('<record>')) {
  return 'FORMAT_B';
}
```

### 4.2 Parsing Format A

**Structure:**
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

**Mapping:**
- `DATAID` → `referenceNumber`
- `FIRST_NAME` + `SECOND_NAME` → `primaryName`
- `ALIAS/NAME` → `aliases[]`
- `DATE_OF_BIRTH/DATE` → `biographicalDetails.dateOfBirth`

### 4.3 Parsing Format B

**Structure:**
```xml
<records>
  <record id="REG-001" dateListed="2020-01-01">
    <name>John Smith</name>
    <alias quality="good">Johnny</alias>
    <dateOfBirth precision="EXACT">1970-01-01</dateOfBirth>
  </record>
</records>
```

**Mapping:**
- `@id` → `referenceNumber`
- `<name>` → `primaryName`
- `<alias>` → `aliases[]`
- `<dateOfBirth>` → `biographicalDetails.dateOfBirth`

### 4.4 Validation

Parser validates:
- Well-formed XML
- Required fields present
- Correct data types

Invalid files are rejected.

---

## 5. Web Interface

### 5.1 Dashboard (`/`)

**Components:**
- Statistics cards
- System status
- Synchronization information

**Displayed Data:**
- Total records
- Number of categories
- Last update date

### 5.2 Search Page (`/search`)

**Components:**
- Input field
- Filters (type, minimum score)
- Results list
- Pagination

**Interaction:**
1. User enters text
2. System validates (minimum 2 characters)
3. Results sorted by score
4. User can view details

### 5.3 Details Page (`/records/:id`)

**Components:**
- Primary name
- Alias list
- Biographical data
- Documents
- Metadata

### 5.4 Data Management (`/data`)

**Components:**
- Upload area
- List of loaded files
- Statistics
- Action buttons

**Interaction:**
1. User selects file
2. System processes
3. Statistics updated

---

## 6. Internal API

### 6.1 Search Functions

#### `searchRecords(name, type?, limit?, page?, minScore?)`

**Parameters:**
- `name` (string, required): Text to search
- `type` (string, optional): Filter by type
- `limit` (number, optional): Results per page (default: 20)
- `page` (number, optional): Page number (default: 1)
- `minScore` (number, optional): Minimum score 0-100 (default: 0)

**Return:**
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

**Example:**
```typescript
const results = await searchRecords('John Smith', 'TYPE_A', 10, 1, 50);
```

### 6.2 Data Functions

#### `getRecordById(id)`

**Parameters:**
- `id` (number): Record ID

**Return:**
```typescript
Promise<Record | null>
```

#### `getDashboardStats()`

**Return:**
```typescript
Promise<{
  totalRecords: number,
  totalTypeA: number,
  totalTypeB: number,
  lastUpdateTime: string | null
}>
```

### 6.3 Upload Functions

#### `parseXMLContent(xmlContent)`

**Parameters:**
- `xmlContent` (string): XML content

**Return:**
```typescript
Record[]
```

#### `addUploadedRecords(records)`

**Parameters:**
- `records` (Record[]): Records to add

#### `clearUploadedRecords()`

Clears all uploaded records.

### 6.4 Cache Functions

#### `clearRecordsCache()`

Invalidates cache forcing reload.

---

## 7. State Management

### 7.1 Cache Strategy

System uses in-memory cache:

```typescript
let cachedRecords: Record[] | null = null;
```

**Operation:**
1. First query loads data
2. Subsequent queries use cache
3. Cache invalidated manually

### 7.2 Cache Invalidation

Cache invalidated on:
- Upload of new files
- Click on "Reload"
- Click on "Clear"
- Page reload

### 7.3 Performance

**Average Times:**
- Initial load: 50-200ms
- Cached search: 100-300ms
- Non-cached search: 200-500ms

---

## 8. Tests

### 8.1 Structure

**Files:**
- `src/test/similarity.test.ts` - 35 tests
- `src/test/api.test.ts` - 30 tests
- `src/test/Layout.test.tsx` - 6 tests
- `src/test/Dashboard.test.tsx` - 6 tests
- `src/test/SearchPage.test.tsx` - 9 tests

**Total:** 86 tests, 95% coverage

### 8.2 Similarity Tests

**Scenarios:**
- Identical strings (100%)
- Case differences (100%)
- Accent differences (100%)
- Minor errors (>80%)
- Different strings (<50%)
- Variations (>70%)
- Reversed order (100% with token)

**Example:**
```typescript
it('should match variations', () => {
  const score = calculateSimilarity('John', 'Jon');
  expect(score).toBeGreaterThan(70);
});
```

### 8.3 API Tests

**Scenarios:**
- Search with empty query
- Search with valid query
- Filters by type
- Filters by score
- Pagination
- Sorting

### 8.4 Component Tests

**Scenarios:**
- Correct rendering
- User interaction
- Loading states
- Form validation

### 8.5 Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

---

## 9. Installation

### 9.1 Development

```bash
npm install
npm run dev
```

Access http://localhost:3000

### 9.2 Production Build

```bash
npm run build
```

Files in `dist/`

### 9.3 Docker

**Build:**
```bash
docker-compose up -d --build
```

**Access:**
http://localhost:3000

**Stop:**
```bash
docker-compose down
```

### 9.4 Directory Structure

```
project/
+-- public/
|   +-- archives/
|       +-- manifest.json
+-- src/
|   +-- api/
|   |   +-- client.ts
|   +-- components/
|   |   +-- Layout.tsx
|   +-- lib/
|   |   +-- similarity.ts
|   |   +-- xml-parser.ts
|   +-- pages/
|   |   +-- Dashboard.tsx
|   |   +-- SearchPage.tsx
|   |   +-- RecordDetails.tsx
|   |   +-- DataManager.tsx
|   |   +-- AdminPage.tsx
|   +-- test/
|   +-- types/
|   |   +-- index.ts
|   +-- App.tsx
|   +-- main.tsx
+-- docker-compose.yml
+-- Dockerfile
+-- package.json
+-- README.md
```

---

## 10. References

LEVENSTEIN, V. I. Binary codes capable of correcting deletions, insertions, and reversals. Soviet Physics Doklady, v. 10, n. 8, p. 707-710, 1965.

JARO, M. A. Advances in record-linkage methodology. Journal of the American Statistical Association, v. 84, n. 406, p. 414-423, 1989.

WINKLER, W. E. The state of record linkage and current research problems. U.S. Bureau of the Census, 1999.

---

**Version:** 1.0.0
**Last Update:** December 2024
