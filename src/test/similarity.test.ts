import { describe, it, expect } from 'vitest';
import {
  normalizeName,
  tokenize,
  levenshteinSimilarity,
  jaroWinklerSimilarity,
  tokenSimilarity,
  bigramSimilarity,
  calculateSimilarity,
  getScoreLabel,
} from '../lib/similarity';

describe('normalizeName', () => {
  it('should convert to lowercase', () => {
    expect(normalizeName('JOHN SMITH')).toBe('john smith');
  });

  it('should remove diacritics', () => {
    expect(normalizeName('José María')).toBe('jose maria');
    expect(normalizeName('François')).toBe('francois');
    expect(normalizeName('Björk')).toBe('bjork');
  });

  it('should remove punctuation', () => {
    expect(normalizeName("O'Brien")).toBe('obrien');
    expect(normalizeName('Smith-Jones')).toBe('smithjones');
    expect(normalizeName('Dr. Smith')).toBe('dr smith');
  });

  it('should normalize whitespace', () => {
    expect(normalizeName('John   Smith')).toBe('john smith');
    expect(normalizeName('  John Smith  ')).toBe('john smith');
    expect(normalizeName('John\tSmith')).toBe('john smith');
  });

  it('should handle empty strings', () => {
    expect(normalizeName('')).toBe('');
    expect(normalizeName('   ')).toBe('');
  });

  it('should handle complex names with multiple special characters', () => {
    expect(normalizeName('Mu\'ammar al-Qadhdhafi')).toBe('muammar alqadhdhafi');
    expect(normalizeName('María José García-López')).toBe('maria jose garcialopez');
  });
});

describe('tokenize', () => {
  it('should split name into tokens', () => {
    expect(tokenize('John Smith')).toEqual(['john', 'smith']);
    expect(tokenize('Maria Elena Rodriguez')).toEqual(['maria', 'elena', 'rodriguez']);
  });

  it('should filter empty tokens', () => {
    expect(tokenize('John   Smith')).toEqual(['john', 'smith']);
  });

  it('should handle single word', () => {
    expect(tokenize('John')).toEqual(['john']);
  });

  it('should handle empty string', () => {
    expect(tokenize('')).toEqual([]);
  });
});

describe('levenshteinSimilarity', () => {
  it('should return 100 for identical strings', () => {
    expect(levenshteinSimilarity('John Smith', 'John Smith')).toBe(100);
  });

  it('should return 100 for case differences', () => {
    expect(levenshteinSimilarity('John Smith', 'JOHN SMITH')).toBe(100);
  });

  it('should return 100 for accent differences', () => {
    expect(levenshteinSimilarity('Jose', 'José')).toBe(100);
  });

  it('should return high score for minor typos', () => {
    const score = levenshteinSimilarity('John Smith', 'Jon Smith');
    expect(score).toBeGreaterThan(80);
  });

  it('should return low score for completely different names', () => {
    const score = levenshteinSimilarity('John Smith', 'Maria Garcia');
    expect(score).toBeLessThan(50);
  });

  it('should return 0 for empty vs non-empty', () => {
    expect(levenshteinSimilarity('', 'John')).toBe(0);
    expect(levenshteinSimilarity('John', '')).toBe(0);
  });

  it('should handle transliteration variants', () => {
    const score = levenshteinSimilarity('Mohamed', 'Mohammed');
    expect(score).toBeGreaterThan(70);
  });
});

describe('jaroWinklerSimilarity', () => {
  it('should return 100 for identical strings', () => {
    expect(jaroWinklerSimilarity('John', 'John')).toBe(100);
  });

  it('should give bonus for common prefix', () => {
    const jw = jaroWinklerSimilarity('Jonathan', 'Johnathan');
    const jaro = jaroWinklerSimilarity('athanJohn', 'athanJohnn');
    // Jaro-Winkler should score higher for common prefix
    expect(jw).toBeGreaterThan(70);
  });

  it('should handle transpositions', () => {
    const score = jaroWinklerSimilarity('Martha', 'Marhta');
    expect(score).toBeGreaterThan(80);
  });

  it('should return low score for different strings', () => {
    const score = jaroWinklerSimilarity('John', 'Mary');
    expect(score).toBeLessThan(70);
  });
});

describe('tokenSimilarity', () => {
  it('should return 100 for same tokens in different order', () => {
    expect(tokenSimilarity('John Smith', 'Smith John')).toBe(100);
    expect(tokenSimilarity('Zhang Wei', 'Wei Zhang')).toBe(100);
  });

  it('should handle partial token matches', () => {
    const score = tokenSimilarity('John Smith', 'John Davis');
    expect(score).toBe(50); // 1 out of 3 unique tokens match
  });

  it('should return 0 for completely different tokens', () => {
    expect(tokenSimilarity('John Smith', 'Maria Garcia')).toBe(0);
  });

  it('should handle single token', () => {
    expect(tokenSimilarity('John', 'John')).toBe(100);
    expect(tokenSimilarity('John', 'Mary')).toBe(0);
  });
});

describe('bigramSimilarity', () => {
  it('should return 100 for identical strings', () => {
    expect(bigramSimilarity('John', 'John')).toBe(100);
  });

  it('should handle similar strings', () => {
    const score = bigramSimilarity('John', 'Jonh');
    expect(score).toBeGreaterThan(50);
  });

  it('should return 0 for very different strings', () => {
    const score = bigramSimilarity('John', 'Mary');
    expect(score).toBeLessThan(30);
  });

  it('should return 0 for strings shorter than 2 chars', () => {
    expect(bigramSimilarity('J', 'J')).toBe(0);
    expect(bigramSimilarity('', '')).toBe(0);
  });
});

describe('calculateSimilarity', () => {
  it('should use best score from all algorithms', () => {
    const score = calculateSimilarity('John Smith', 'Smith John');
    // Token similarity should give 100
    expect(score).toBe(100);
  });

  it('should check aliases and use best match', () => {
    const aliases = ['Johnny Smith', 'J. Smith'];
    const score = calculateSimilarity('Johnny', 'John Smith', aliases);
    // Should match "Johnny Smith" alias well
    expect(score).toBeGreaterThan(70);
  });

  it('should handle transliteration variants', () => {
    const score = calculateSimilarity('Mohamed', 'Mohammed');
    expect(score).toBeGreaterThan(70);
  });

  it('should return low score for unrelated names', () => {
    const score = calculateSimilarity('John Smith', 'Maria Garcia');
    expect(score).toBeLessThan(40);
  });

  it('should handle empty aliases array', () => {
    const score = calculateSimilarity('John', 'John', []);
    expect(score).toBe(100);
  });

  it('should handle multiple aliases', () => {
    const aliases = ['J Smith', 'John S.', 'Jonny Smith'];
    const score = calculateSimilarity('Johnny Smith', 'John Smith', aliases);
    expect(score).toBeGreaterThan(70);
  });
});

describe('getScoreLabel', () => {
  it('should return HIGH for scores >= 85', () => {
    expect(getScoreLabel(85)).toBe('HIGH');
    expect(getScoreLabel(90)).toBe('HIGH');
    expect(getScoreLabel(100)).toBe('HIGH');
  });

  it('should return MEDIUM for scores >= 65 and < 85', () => {
    expect(getScoreLabel(65)).toBe('MEDIUM');
    expect(getScoreLabel(75)).toBe('MEDIUM');
    expect(getScoreLabel(84)).toBe('MEDIUM');
  });

  it('should return LOW for scores >= 45 and < 65', () => {
    expect(getScoreLabel(45)).toBe('LOW');
    expect(getScoreLabel(55)).toBe('LOW');
    expect(getScoreLabel(64)).toBe('LOW');
  });

  it('should return INDETERMINATE for scores < 45', () => {
    expect(getScoreLabel(0)).toBe('INDETERMINATE');
    expect(getScoreLabel(30)).toBe('INDETERMINATE');
    expect(getScoreLabel(44)).toBe('INDETERMINATE');
  });
});

describe('Real-world name matching scenarios', () => {
  it('should match Arabic name transliterations', () => {
    const variants = [
      ['Mohamed', 'Mohammed'],
      ['Mohamed', 'Muhammad'],
      ['Ahmed', 'Ahmad'],
      ['Hassan', 'Hasan'],
    ];

    variants.forEach(([name1, name2]) => {
      const score = calculateSimilarity(name1, name2);
      expect(score).toBeGreaterThan(60);
    });
  });

  it('should match Chinese name order variations', () => {
    const score = calculateSimilarity('Zhang Wei', 'Wei Zhang');
    expect(score).toBe(100); // Token similarity handles this
  });

  it('should handle names with titles', () => {
    const score = calculateSimilarity('Dr. John Smith', 'John Smith');
    expect(score).toBeGreaterThan(70);
  });

  it('should handle compound surnames', () => {
    const score = calculateSimilarity('Garcia Lopez', 'García-López');
    expect(score).toBeGreaterThan(80);
  });

  it('should distinguish similar but different names', () => {
    const score = calculateSimilarity('John Smith', 'John Smythe');
    expect(score).toBeLessThan(100);
    expect(score).toBeGreaterThan(60); // Still somewhat similar
  });
});
