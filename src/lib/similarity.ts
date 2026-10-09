/**
 * Deterministic name similarity algorithms.
 * These are independent of any language model.
 */

// Normalize a name for comparison
export function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Tokenize a name into sorted tokens
export function tokenize(name: string): string[] {
  return normalizeName(name).split(/\s+/).filter(t => t.length > 0);
}

// Tokenize without sorting (preserve order)
export function tokenizeOrdered(name: string): string[] {
  return normalizeName(name).split(/\s+/).filter(t => t.length > 0);
}

/**
 * Normalized Levenshtein similarity (0-100)
 */
export function levenshteinSimilarity(a: string, b: string): number {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (na === nb) return 100;
  if (na.length === 0 || nb.length === 0) return 0;

  const maxLen = Math.max(na.length, nb.length);
  const dist = levenshteinDistance(na, nb);
  return Math.round(((maxLen - dist) / maxLen) * 100);
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }
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

/**
 * Jaro-Winkler similarity (0-100)
 */
export function jaroWinklerSimilarity(a: string, b: string): number {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (na === nb) return 100;
  if (na.length === 0 || nb.length === 0) return 0;

  const jaro = jaroSimilarity(na, nb);
  const prefix = commonPrefix(na, nb, 4);
  return Math.round((jaro + prefix * 0.1 * (1 - jaro)) * 100);
}

function jaroSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const lenA = a.length;
  const lenB = b.length;
  const matchDistance = Math.max(Math.floor(Math.max(lenA, lenB) / 2) - 1, 0);

  const aMatches = new Array(lenA).fill(false);
  const bMatches = new Array(lenB).fill(false);

  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < lenA; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, lenB);
    for (let j = start; j < end; j++) {
      if (bMatches[j] || a[i] !== b[j]) continue;
      aMatches[i] = true;
      bMatches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0;

  let k = 0;
  for (let i = 0; i < lenA; i++) {
    if (!aMatches[i]) continue;
    while (!bMatches[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }

  return (
    (matches / lenA + matches / lenB + (matches - transpositions / 2) / matches) / 3
  );
}

function commonPrefix(a: string, b: string, maxLen: number): number {
  let prefix = 0;
  for (let i = 0; i < Math.min(a.length, b.length, maxLen); i++) {
    if (a[i] === b[i]) prefix++;
    else break;
  }
  return prefix;
}

/**
 * Token-based similarity (order-independent)
 */
export function tokenSimilarity(a: string, b: string): number {
  const tokensA = new Set(tokenize(a));
  const tokensB = new Set(tokenize(b));
  if (tokensA.size === 0 && tokensB.size === 0) return 100;
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  tokensA.forEach(t => { if (tokensB.has(t)) intersection++; });

  const union = new Set([...tokensA, ...tokensB]).size;
  return Math.round((intersection / union) * 100);
}

/**
 * Bigram similarity (Dice coefficient)
 */
export function bigramSimilarity(a: string, b: string): number {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (na === nb) return 100;
  if (na.length < 2 || nb.length < 2) return 0;

  const bigramsA = new Set<string>();
  const bigramsB = new Set<string>();

  for (let i = 0; i < na.length - 1; i++) bigramsA.add(na.substring(i, i + 2));
  for (let i = 0; i < nb.length - 1; i++) bigramsB.add(nb.substring(i, i + 2));

  let intersection = 0;
  bigramsA.forEach(bg => { if (bigramsB.has(bg)) intersection++; });

  return Math.round((2 * intersection / (bigramsA.size + bigramsB.size)) * 100);
}

/**
 * Combined similarity score (0-100)
 */
export function calculateSimilarity(searchName: string, candidateName: string, aliases: string[] = []): number {
  const directLev = levenshteinSimilarity(searchName, candidateName);
  const directJW = jaroWinklerSimilarity(searchName, candidateName);
  const directToken = tokenSimilarity(searchName, candidateName);
  const directBigram = bigramSimilarity(searchName, candidateName);

  let bestScore = Math.max(directLev, directJW, directToken, directBigram);

  // Check aliases
  for (const alias of aliases) {
    const aliasLev = levenshteinSimilarity(searchName, alias);
    const aliasJW = jaroWinklerSimilarity(searchName, alias);
    const aliasToken = tokenSimilarity(searchName, alias);
    const aliasBigram = bigramSimilarity(searchName, alias);
    const aliasScore = Math.max(aliasLev, aliasJW, aliasToken, aliasBigram);
    if (aliasScore > bestScore) {
      bestScore = aliasScore;
    }
  }

  return bestScore;
}

/**
 * Get score label based on threshold
 */
export function getScoreLabel(score: number): 'HIGH' | 'MEDIUM' | 'LOW' | 'INDETERMINATE' {
  if (score >= 85) return 'HIGH';
  if (score >= 65) return 'MEDIUM';
  if (score >= 45) return 'LOW';
  return 'INDETERMINATE';
}

/**
 * Common transliteration variants for name matching
 */
export const transliterationPatterns: Record<string, string[]> = {
  'mohamed': ['mohammed', 'muhammad', 'muhammed', 'mohammad', 'muhamad', 'mohamad', 'muhamed'],
  'ahmed': ['ahmad', 'ahmet', 'akhmad', 'ahmadd'],
  'ali': ['aley', 'aly', 'alii'],
  'hassan': ['hasan', 'hassane', 'hassen'],
  'hussein': ['husein', 'hussain', 'husain', 'hussayn'],
  'gaddafi': ['gadafi', 'qaddafi', 'qadhafi', 'gathafi', 'el-qathafi', 'khadafi'],
  'omar': ['omarr', 'umar', 'omr'],
};
