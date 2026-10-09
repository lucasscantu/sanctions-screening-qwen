-- V1: Initial schema for UN Sanctions Screening System

-- Main sanctions records table
CREATE TABLE sanctioned_record (
    id BIGSERIAL PRIMARY KEY,
    reference_number VARCHAR(100) NOT NULL UNIQUE,
    record_type VARCHAR(20) NOT NULL CHECK (record_type IN ('INDIVIDUAL', 'ENTITY')),
    primary_name VARCHAR(500) NOT NULL,
    listing_date DATE,
    last_update DATE,
    first_imported TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_synchronized TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    source_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (source_status IN ('ACTIVE', 'INACTIVE', 'REMOVED')),
    source_url TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Name aliases table
CREATE TABLE name_alias (
    id BIGSERIAL PRIMARY KEY,
    sanctioned_record_id BIGINT NOT NULL REFERENCES sanctioned_record(id) ON DELETE CASCADE,
    alias_name VARCHAR(500) NOT NULL,
    quality VARCHAR(50),
    original_representation TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Biographical details table
CREATE TABLE biographical_detail (
    id BIGSERIAL PRIMARY KEY,
    sanctioned_record_id BIGINT NOT NULL REFERENCES sanctioned_record(id) ON DELETE CASCADE,
    date_of_birth DATE,
    date_precision VARCHAR(20) CHECK (date_precision IN ('EXACT', 'YEAR_ONLY', 'APPROXIMATE')),
    place_of_birth VARCHAR(500),
    nationality VARCHAR(100),
    gender VARCHAR(10),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Identification documents table
CREATE TABLE identification_document (
    id BIGSERIAL PRIMARY KEY,
    biographical_detail_id BIGINT NOT NULL REFERENCES biographical_detail(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_number VARCHAR(200) NOT NULL,
    issuing_country VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Addresses table
CREATE TABLE address (
    id BIGSERIAL PRIMARY KEY,
    biographical_detail_id BIGINT NOT NULL REFERENCES biographical_detail(id) ON DELETE CASCADE,
    address_text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Sanctions programs table
CREATE TABLE sanctions_program (
    id BIGSERIAL PRIMARY KEY,
    sanctioned_record_id BIGINT NOT NULL REFERENCES sanctioned_record(id) ON DELETE CASCADE,
    program VARCHAR(500) NOT NULL,
    reference_info TEXT,
    listing_details TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Import jobs table
CREATE TABLE import_job (
    id BIGSERIAL PRIMARY KEY,
    start_time TIMESTAMP NOT NULL,
    completion_time TIMESTAMP,
    status VARCHAR(20) NOT NULL CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL')),
    records_created INTEGER NOT NULL DEFAULT 0,
    records_updated INTEGER NOT NULL DEFAULT 0,
    records_removed INTEGER NOT NULL DEFAULT 0,
    failures INTEGER NOT NULL DEFAULT 0,
    error_summary TEXT,
    source_url TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Search history table (optional, for audit)
CREATE TABLE search_history (
    id BIGSERIAL PRIMARY KEY,
    search_query VARCHAR(500) NOT NULL,
    record_type VARCHAR(20),
    results_count INTEGER NOT NULL,
    search_time_ms INTEGER NOT NULL,
    user_id VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_sanctioned_record_reference ON sanctioned_record(reference_number);
CREATE INDEX idx_sanctioned_record_type ON sanctioned_record(record_type);
CREATE INDEX idx_sanctioned_record_status ON sanctioned_record(source_status);
CREATE INDEX idx_sanctioned_record_primary_name ON sanctioned_record USING gin(to_tsvector('english', primary_name));

CREATE INDEX idx_name_alias_record ON name_alias(sanctioned_record_id);
CREATE INDEX idx_name_alias_name ON name_alias USING gin(to_tsvector('english', alias_name));

CREATE INDEX idx_biographical_record ON biographical_detail(sanctioned_record_id);
CREATE INDEX idx_biographical_nationality ON biographical_detail(nationality);

CREATE INDEX idx_sanctions_program_record ON sanctions_program(sanctioned_record_id);

CREATE INDEX idx_import_job_status ON import_job(status);
CREATE INDEX idx_import_job_start_time ON import_job(start_time DESC);

CREATE INDEX idx_search_history_created ON search_history(created_at DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sanctioned_record_updated_at
    BEFORE UPDATE ON sanctioned_record
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
