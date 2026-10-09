export type RecordType = 'INDIVIDUAL' | 'ENTITY';

export interface SanctionedRecord {
  id: number;
  referenceNumber: string;
  recordType: RecordType;
  primaryName: string;
  listingDate: string | null;
  lastUpdate: string | null;
  firstImported: string;
  lastSynchronized: string;
  sourceStatus: 'ACTIVE' | 'INACTIVE' | 'REMOVED';
  sourceUrl: string;
  aliases: NameAlias[];
  biographicalDetails: BiographicalDetail[];
  sanctionsPrograms: SanctionsProgram[];
}

export interface NameAlias {
  id: number;
  aliasName: string;
  quality: string | null;
  originalRepresentation: string | null;
}

export interface BiographicalDetail {
  dateOfBirth: string | null;
  datePrecision: 'EXACT' | 'YEAR_ONLY' | 'APPROXIMATE' | null;
  placeOfBirth: string | null;
  nationality: string | null;
  gender: string | null;
  identificationDocuments: IdentificationDocument[];
  addresses: string[];
}

export interface IdentificationDocument {
  type: string;
  number: string;
  issuingCountry: string | null;
  issueDate: string | null;
  expiryDate: string | null;
}

export interface SanctionsProgram {
  program: string;
  referenceInfo: string | null;
  listingDetails: string | null;
}

export interface ImportJob {
  id: number;
  startTime: string;
  completionTime: string | null;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PARTIAL';
  recordsCreated: number;
  recordsUpdated: number;
  recordsRemoved: number;
  failures: number;
  errorSummary: string | null;
  sourceUrl: string;
}

export interface SearchResult {
  record: SanctionedRecord;
  matchingAlias: string | null;
  deterministicScore: number;
  aiAnalysis: AIAnalysis | null;
  finalScore: number;
  scoreLabel: 'HIGH' | 'MEDIUM' | 'LOW' | 'INDETERMINATE';
  experimental: boolean;
}

export interface AIAnalysis {
  linguisticVariants: boolean;
  explanation: string;
  supportingFields: string[];
  conflictingFields: string[];
  missingInformation: string[];
  qualitativeAssessment: 'HIGH' | 'MEDIUM' | 'LOW' | 'INDETERMINATE';
  disclaimer: string;
}

export interface SearchResponse {
  query: string;
  totalResults: number;
  page: number;
  pageSize: number;
  results: SearchResult[];
  aiAvailable: boolean;
  aiModel: string | null;
  searchTimeMs: number;
}

export interface DashboardStats {
  totalIndividuals: number;
  totalEntities: number;
  lastSyncTime: string | null;
  lastSyncStatus: 'SUCCESS' | 'FAILED' | 'PARTIAL' | 'NEVER';
  recentFailures: ImportJob[];
  ollamaAvailable: boolean;
  ollamaModel: string | null;
  dataFreshness: string | null;
  totalRecords: number;
}

export interface SyncStatus {
  lastSync: ImportJob | null;
  isRunning: boolean;
  scheduledInterval: string;
  nextScheduledRun: string | null;
}
