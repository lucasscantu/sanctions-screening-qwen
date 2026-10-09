import { SearchResponse, SearchResult, SanctionedRecord, DashboardStats, SyncStatus, ImportJob } from '../types';
import { calculateSimilarity, getScoreLabel } from '../lib/similarity';
import { loadAllSanctionsXML, SanctionsXMLParser } from '../lib/xml-parser';

// Cache dos registros carregados do XML
let cachedRecords: SanctionedRecord[] | null = null;

// Registros carregados via upload (na sessão atual)
let uploadedRecords: SanctionedRecord[] = [];

/**
 * Carrega registros do XML (com cache)
 */
async function getRecords(): Promise<SanctionedRecord[]> {
  if (!cachedRecords) {
    const fileRecords = await loadAllSanctionsXML();
    cachedRecords = [...fileRecords, ...uploadedRecords];
  }
  return cachedRecords;
}

/**
 * Limpa o cache de registros
 */
export function clearRecordsCache(): void {
  cachedRecords = null;
}

/**
 * Adiciona registros via upload de arquivo XML
 */
export function addUploadedRecords(records: SanctionedRecord[]): void {
  uploadedRecords = [...uploadedRecords, ...records];
  cachedRecords = null; // Invalida cache para recarregar
}

/**
 * Carrega arquivo XML a partir de string de conteúdo
 */
export function parseXMLContent(xmlContent: string): SanctionedRecord[] {
  return SanctionsXMLParser.parse(xmlContent);
}

/**
 * Limpa todos os registros carregados via upload
 */
export function clearUploadedRecords(): void {
  uploadedRecords = [];
  cachedRecords = null;
}

/**
 * Busca e processa XML de uma URL
 */
export async function fetchXMLFromURL(url: string): Promise<{ records: SanctionedRecord[]; filename: string }> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const xmlContent = await response.text();
    const records = SanctionsXMLParser.parse(xmlContent);
    
    // Extrair nome do arquivo da URL
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1] || 'remote-xml';
    
    return { records, filename };
  } catch (error) {
    throw new Error(`Erro ao buscar XML da URL: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

function generateAIAnalysis(searchName: string, record: SanctionedRecord, score: number) {
  const normalizedSearch = searchName.toLowerCase().trim();
  const normalizedRecord = record.primaryName.toLowerCase().trim();
  
  const supportingFields: string[] = [];
  const conflictingFields: string[] = [];
  const missingInformation: string[] = [];

  const searchTokens = normalizedSearch.split(/\s+/);
  const recordTokens = normalizedRecord.split(/\s+/);
  const sharedTokens = searchTokens.filter(t => recordTokens.includes(t));
  
  if (sharedTokens.length > 0) {
    supportingFields.push(`Shared name components: ${sharedTokens.join(', ')}`);
  }

  const matchingAliases = record.aliases.filter(a => {
    const aliasTokens = a.aliasName.toLowerCase().split(/\s+/);
    return searchTokens.some(t => aliasTokens.includes(t));
  });

  if (matchingAliases.length > 0) {
    supportingFields.push(`Matching alias: ${matchingAliases[0].aliasName}`);
  }

  if (record.biographicalDetails.length > 0) {
    const bio = record.biographicalDetails[0];
    if (bio.nationality) supportingFields.push(`Nationality: ${bio.nationality}`);
    if (bio.placeOfBirth) supportingFields.push(`Place of birth: ${bio.placeOfBirth}`);
    if (bio.dateOfBirth) supportingFields.push(`Date of birth: ${bio.dateOfBirth}`);
  }

  if (!record.biographicalDetails[0]?.dateOfBirth) {
    missingInformation.push('Date of birth not available for comparison');
  }
  if (!record.biographicalDetails[0]?.nationality) {
    missingInformation.push('Nationality not available for comparison');
  }

  const isLinguisticVariant = score >= 60 && sharedTokens.length >= 1;
  
  let explanation = '';
  if (score >= 85) {
    explanation = `The searched name and the listed name show very high textual similarity. The shared components suggest these may be spelling variants or transliterations of the same name.`;
  } else if (score >= 65) {
    explanation = `The names show moderate similarity. Differences may be due to transliteration conventions, spelling variations, or the use of different name components.`;
  } else if (score >= 45) {
    explanation = `The names show some similarity but with notable differences. This could indicate a partial match, a different transliteration, or an unrelated name with coincidental similarity.`;
  } else {
    explanation = `The names show low similarity. Any resemblance is likely coincidental.`;
  }

  const qualitativeAssessment = getScoreLabel(score);

  return {
    linguisticVariants: isLinguisticVariant,
    explanation,
    supportingFields,
    conflictingFields,
    missingInformation,
    qualitativeAssessment,
    disclaimer: 'Name similarity alone cannot establish identity. This analysis is based on textual comparison and does not constitute a determination of personal identity.',
  };
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function searchRecords(
  name: string,
  type?: 'INDIVIDUAL' | 'ENTITY',
  limit: number = 20,
  page: number = 1,
  minScore: number = 0
): Promise<SearchResponse> {
  await delay(100 + Math.random() * 200);

  if (!name || name.trim().length < 2) {
    return {
      query: name,
      totalResults: 0,
      page,
      pageSize: limit,
      results: [],
      aiAvailable: true,
      aiModel: 'qwen3:4b',
      searchTimeMs: 0,
    };
  }

  const startTime = Date.now();
  const records = await getRecords();
  
  if (records.length === 0) {
    return {
      query: name,
      totalResults: 0,
      page,
      pageSize: limit,
      results: [],
      aiAvailable: false,
      aiModel: null,
      searchTimeMs: Date.now() - startTime,
    };
  }

  const results: SearchResult[] = [];

  for (const record of records) {
    if (type && record.recordType !== type) continue;

    const aliases = record.aliases.map(a => a.aliasName);
    const score = calculateSimilarity(name, record.primaryName, aliases);
    
    if (score >= minScore) {
      const matchingAlias = record.aliases.find(a => {
        const aliasScore = calculateSimilarity(name, a.aliasName);
        return aliasScore >= score - 5;
      })?.aliasName || null;

      const aiAnalysis = score >= 30 ? generateAIAnalysis(name, record, score) : null;

      const finalScore = aiAnalysis 
        ? Math.min(100, Math.round(score * 0.7 + (aiAnalysis.qualitativeAssessment === 'HIGH' ? 100 : aiAnalysis.qualitativeAssessment === 'MEDIUM' ? 70 : aiAnalysis.qualitativeAssessment === 'LOW' ? 40 : 20) * 0.3))
        : score;

      results.push({
        record,
        matchingAlias,
        deterministicScore: score,
        aiAnalysis,
        finalScore,
        scoreLabel: getScoreLabel(finalScore),
        experimental: true,
      });
    }
  }

  results.sort((a, b) => b.finalScore - a.finalScore);

  const searchTimeMs = Date.now() - startTime;

  const startIdx = (page - 1) * limit;
  const paginatedResults = results.slice(startIdx, startIdx + limit);

  return {
    query: name,
    totalResults: results.length,
    page,
    pageSize: limit,
    results: paginatedResults,
    aiAvailable: true,
    aiModel: 'qwen3:4b',
    searchTimeMs,
  };
}

export async function getRecordById(id: number): Promise<SanctionedRecord | null> {
  await delay(50);
  const records = await getRecords();
  return records.find(r => r.id === id) || null;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await delay(100);
  const records = await getRecords();
  
  const individuals = records.filter(r => r.recordType === 'INDIVIDUAL').length;
  const entities = records.filter(r => r.recordType === 'ENTITY').length;

  return {
    totalIndividuals: individuals,
    totalEntities: entities,
    totalRecords: records.length,
    lastSyncTime: records.length > 0 ? new Date().toISOString() : null,
    lastSyncStatus: records.length > 0 ? 'SUCCESS' : 'NEVER',
    recentFailures: [],
    ollamaAvailable: true,
    ollamaModel: 'qwen3:4b',
    dataFreshness: records.length > 0 ? new Date().toISOString().split('T')[0] : null,
  };
}

export async function getSyncStatus(): Promise<SyncStatus> {
  await delay(50);
  const records = await getRecords();
  
  return {
    lastSync: records.length > 0 ? {
      id: 1,
      startTime: new Date().toISOString(),
      completionTime: new Date().toISOString(),
      status: 'COMPLETED',
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsRemoved: 0,
      failures: 0,
      errorSummary: null,
      sourceUrl: 'Local XML Files',
    } : null,
    isRunning: false,
    scheduledInterval: 'Manual',
    nextScheduledRun: null,
  };
}

export async function getImportHistory(): Promise<ImportJob[]> {
  await delay(50);
  const records = await getRecords();
  
  if (records.length === 0) {
    return [];
  }
  
  return [{
    id: 1,
    startTime: new Date().toISOString(),
    completionTime: new Date().toISOString(),
    status: 'COMPLETED',
    recordsCreated: records.length,
    recordsUpdated: 0,
    recordsRemoved: 0,
    failures: 0,
    errorSummary: null,
    sourceUrl: 'Local XML Files',
  }];
}

export async function triggerSync(): Promise<ImportJob> {
  await delay(500);
  clearRecordsCache();
  const records = await getRecords();
  
  return {
    id: Date.now(),
    startTime: new Date().toISOString(),
    completionTime: new Date().toISOString(),
    status: 'COMPLETED',
    recordsCreated: records.length,
    recordsUpdated: 0,
    recordsRemoved: 0,
    failures: 0,
    errorSummary: null,
    sourceUrl: 'Local XML Files',
  };
}

export async function checkOllamaHealth(): Promise<{ available: boolean; model: string }> {
  await delay(50);
  return { available: true, model: 'qwen3:4b' };
}
