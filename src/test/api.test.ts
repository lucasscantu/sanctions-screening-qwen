import { describe, it, expect, beforeEach } from 'vitest';
import {
  searchRecords,
  getRecordById,
  getDashboardStats,
  getSyncStatus,
  getImportHistory,
  triggerSync,
  checkOllamaHealth,
  clearRecordsCache,
  addUploadedRecords,
  clearUploadedRecords,
} from '../api/client';
import { SanctionedRecord } from '../types';

// Neutral test data
const mockRecords: SanctionedRecord[] = [
  {
    id: 1,
    referenceNumber: 'TEST-001',
    recordType: 'INDIVIDUAL',
    primaryName: 'Person Alpha',
    listingDate: '2020-01-01',
    lastUpdate: '2024-01-01',
    firstImported: '2024-01-01T00:00:00Z',
    lastSynchronized: '2024-01-01T00:00:00Z',
    sourceStatus: 'ACTIVE',
    sourceUrl: 'test',
    aliases: [
      { id: 1, aliasName: 'P. Alpha', quality: 'good', originalRepresentation: null },
    ],
    biographicalDetails: [{
      dateOfBirth: '1970-01-01',
      datePrecision: 'EXACT',
      placeOfBirth: 'City A',
      nationality: 'Nationality A',
      gender: 'M',
      identificationDocuments: [],
      addresses: ['City A'],
    }],
    sanctionsPrograms: [{
      program: 'Program A',
      referenceInfo: 'Test',
      listingDetails: 'Test details',
    }],
  },
  {
    id: 2,
    referenceNumber: 'TEST-002',
    recordType: 'ENTITY',
    primaryName: 'Organization Beta',
    listingDate: '2021-01-01',
    lastUpdate: '2024-01-01',
    firstImported: '2024-01-01T00:00:00Z',
    lastSynchronized: '2024-01-01T00:00:00Z',
    sourceStatus: 'ACTIVE',
    sourceUrl: 'test',
    aliases: [
      { id: 2, aliasName: 'Org Beta', quality: 'good', originalRepresentation: null },
    ],
    biographicalDetails: [{
      dateOfBirth: null,
      datePrecision: null,
      placeOfBirth: null,
      nationality: null,
      gender: null,
      identificationDocuments: [],
      addresses: ['City B'],
    }],
    sanctionsPrograms: [{
      program: 'Program B',
      referenceInfo: 'Test',
      listingDetails: 'Test details',
    }],
  },
];

describe('searchRecords', () => {
  beforeEach(() => {
    clearRecordsCache();
    clearUploadedRecords();
    addUploadedRecords(mockRecords);
  });

  it('should return empty results for empty query', async () => {
    const result = await searchRecords('');
    expect(result.totalResults).toBe(0);
    expect(result.results).toHaveLength(0);
  });

  it('should return empty results for query shorter than 2 chars', async () => {
    const result = await searchRecords('P');
    expect(result.totalResults).toBe(0);
  });

  it('should find records matching the query', async () => {
    const result = await searchRecords('Person');
    expect(result.totalResults).toBeGreaterThan(0);
    expect(result.results.length).toBeGreaterThan(0);
  });

  it('should return results sorted by score descending', async () => {
    const result = await searchRecords('Person');
    if (result.results.length > 1) {
      for (let i = 0; i < result.results.length - 1; i++) {
        expect(result.results[i].finalScore).toBeGreaterThanOrEqual(
          result.results[i + 1].finalScore
        );
      }
    }
  });

  it('should filter by record type INDIVIDUAL', async () => {
    const result = await searchRecords('Person', 'INDIVIDUAL');
    result.results.forEach(r => {
      expect(r.record.recordType).toBe('INDIVIDUAL');
    });
  });

  it('should filter by record type ENTITY', async () => {
    const result = await searchRecords('Organization', 'ENTITY');
    result.results.forEach(r => {
      expect(r.record.recordType).toBe('ENTITY');
    });
  });

  it('should respect minimum score filter', async () => {
    const result = await searchRecords('Person', undefined, 20, 1, 50);
    result.results.forEach(r => {
      expect(r.finalScore).toBeGreaterThanOrEqual(50);
    });
  });

  it('should paginate results', async () => {
    const page1 = await searchRecords('a', undefined, 2, 1);
    const page2 = await searchRecords('a', undefined, 2, 2);
    
    expect(page1.pageSize).toBe(2);
    expect(page1.page).toBe(1);
  });

  it('should include AI analysis for high-scoring results', async () => {
    const result = await searchRecords('Person Alpha');
    const highScoreResult = result.results.find(r => r.finalScore >= 30);
    if (highScoreResult) {
      expect(highScoreResult.aiAnalysis).not.toBeNull();
      expect(highScoreResult.aiAnalysis?.explanation).toBeTruthy();
      expect(highScoreResult.aiAnalysis?.disclaimer).toBeTruthy();
    }
  });

  it('should include matching alias when applicable', async () => {
    const result = await searchRecords('P. Alpha');
    const withAlias = result.results.find(r => r.matchingAlias !== null);
    if (withAlias) {
      expect(typeof withAlias.matchingAlias).toBe('string');
    }
  });

  it('should mark scores as experimental', async () => {
    const result = await searchRecords('Person');
    result.results.forEach(r => {
      expect(r.experimental).toBe(true);
    });
  });

  it('should report AI availability', async () => {
    const result = await searchRecords('Person');
    expect(typeof result.aiAvailable).toBe('boolean');
    expect(result.aiModel).toBe('qwen3:4b');
  });

  it('should measure search time', async () => {
    const result = await searchRecords('Person');
    expect(result.searchTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('should return correct query in response', async () => {
    const result = await searchRecords('Test Query');
    expect(result.query).toBe('Test Query');
  });
});

describe('getRecordById', () => {
  beforeEach(() => {
    clearRecordsCache();
    clearUploadedRecords();
    addUploadedRecords(mockRecords);
  });

  it('should return a record for valid ID', async () => {
    const record = await getRecordById(1);
    expect(record).not.toBeNull();
    expect(record?.id).toBe(1);
    expect(record?.primaryName).toBeTruthy();
    expect(record?.referenceNumber).toBeTruthy();
  });

  it('should return null for non-existent ID', async () => {
    const record = await getRecordById(9999);
    expect(record).toBeNull();
  });

  it('should return record with aliases', async () => {
    const record = await getRecordById(1);
    expect(record?.aliases).toBeDefined();
    expect(Array.isArray(record?.aliases)).toBe(true);
  });

  it('should return record with biographical details', async () => {
    const record = await getRecordById(1);
    expect(record?.biographicalDetails).toBeDefined();
    expect(Array.isArray(record?.biographicalDetails)).toBe(true);
  });

  it('should return record with programs', async () => {
    const record = await getRecordById(1);
    expect(record?.sanctionsPrograms).toBeDefined();
    expect(Array.isArray(record?.sanctionsPrograms)).toBe(true);
  });
});

describe('getDashboardStats', () => {
  beforeEach(() => {
    clearRecordsCache();
  });

  it('should return dashboard statistics', async () => {
    const stats = await getDashboardStats();
    expect(stats).toBeDefined();
    expect(typeof stats.totalIndividuals).toBe('number');
    expect(typeof stats.totalEntities).toBe('number');
    expect(typeof stats.totalRecords).toBe('number');
  });

  it('should include sync status', async () => {
    const stats = await getDashboardStats();
    expect(stats.lastSyncStatus).toBeDefined();
    expect(['SUCCESS', 'FAILED', 'PARTIAL', 'NEVER']).toContain(stats.lastSyncStatus);
  });

  it('should include Ollama status', async () => {
    const stats = await getDashboardStats();
    expect(typeof stats.ollamaAvailable).toBe('boolean');
  });

  it('should include recent failures array', async () => {
    const stats = await getDashboardStats();
    expect(Array.isArray(stats.recentFailures)).toBe(true);
  });
});

describe('getSyncStatus', () => {
  it('should return sync status', async () => {
    const status = await getSyncStatus();
    expect(status).toBeDefined();
    expect(typeof status.isRunning).toBe('boolean');
    expect(status.scheduledInterval).toBeTruthy();
  });

  it('should include last sync information', async () => {
    const status = await getSyncStatus();
    if (status.lastSync) {
      expect(status.lastSync.startTime).toBeTruthy();
      expect(status.lastSync.status).toBeTruthy();
    }
  });
});

describe('getImportHistory', () => {
  beforeEach(() => {
    clearRecordsCache();
    clearUploadedRecords();
  });

  it('should return array of import jobs when data is loaded', async () => {
    addUploadedRecords(mockRecords);
    const history = await getImportHistory();
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThan(0);
  });

  it('should return empty array when no data loaded', async () => {
    const history = await getImportHistory();
    expect(history.length).toBe(0);
  });
});

describe('triggerSync', () => {
  it('should trigger synchronization and return job', async () => {
    const job = await triggerSync();
    expect(job).toBeDefined();
    expect(job.status).toBe('COMPLETED');
    expect(job.startTime).toBeTruthy();
    expect(job.completionTime).toBeTruthy();
    expect(typeof job.recordsUpdated).toBe('number');
  });
});

describe('checkOllamaHealth', () => {
  it('should return Ollama health status', async () => {
    const health = await checkOllamaHealth();
    expect(health).toBeDefined();
    expect(typeof health.available).toBe('boolean');
    expect(health.model).toBeTruthy();
  });
});
