import { SanctionedRecord, NameAlias, BiographicalDetail, SanctionsProgram, IdentificationDocument } from '../types';

/**
 * Parser para arquivo XML de lista de sanções da ONU
 * Suporta o formato oficial XML do UN Security Council Consolidated List
 */
export class SanctionsXMLParser {
  /**
   * Faz o parse do conteúdo XML e retorna array de registros
   * Suporta múltiplos formatos:
   * - Formato oficial ONU (tags em MAIÚSCULAS)
   * - Formato simplificado (tags em minúsculas)
   */
  static parse(xmlContent: string): SanctionedRecord[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    // Verificar erros de parsing
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      throw new Error(`Erro ao fazer parse do XML: ${parseError.textContent}`);
    }

    const records: SanctionedRecord[] = [];

    // Tentar formato oficial ONU primeiro (INDIVIDUAL em maiúsculas)
    const unIndividuals = xmlDoc.querySelectorAll('INDIVIDUAL');
    if (unIndividuals.length > 0) {
      unIndividuals.forEach((individual) => {
        const record = this.parseUNIndividual(individual);
        if (record) records.push(record);
      });
    }

    // Entidades do formato oficial ONU
    const unEntities = xmlDoc.querySelectorAll('ENTITY');
    unEntities.forEach((entity) => {
      const record = this.parseUNEntity(entity);
      if (record) records.push(record);
    });

    // Se não encontrou formato ONU, tentar formato simplificado
    if (records.length === 0) {
      const individuals = xmlDoc.querySelectorAll('individual');
      individuals.forEach((individual) => {
        const record = this.parseSimpleIndividual(individual);
        if (record) records.push(record);
      });

      const entities = xmlDoc.querySelectorAll('entity');
      entities.forEach((entity) => {
        const record = this.parseSimpleEntity(entity);
        if (record) records.push(record);
      });
    }

    return records;
  }

  /**
   * Parse de INDIVIDUAL no formato oficial ONU
   */
  private static parseUNIndividual(element: Element): SanctionedRecord | null {
    const dataId = this.getTextContent(element, 'DATAID');
    const referenceNumber = this.getTextContent(element, 'REFERENCE_NUMBER');
    const listedOn = this.getTextContent(element, 'LISTED_ON');
    const unListType = this.getTextContent(element, 'UN_LIST_TYPE');

    // Construir nome completo a partir das partes
    const firstName = this.getTextContent(element, 'FIRST_NAME');
    const secondName = this.getTextContent(element, 'SECOND_NAME');
    const thirdName = this.getTextContent(element, 'THIRD_NAME');
    const fourthName = this.getTextContent(element, 'FOURTH_NAME');

    const primaryName = [firstName, secondName, thirdName, fourthName]
      .filter(n => n && n.trim().length > 0)
      .join(' ')
      .trim();

    if (!primaryName) return null;

    // Parse de aliases
    const aliases: NameAlias[] = [];
    const aliasElements = element.querySelectorAll('INDIVIDUAL_ALIAS');
    aliasElements.forEach((aliasEl, index) => {
      const quality = this.getTextContent(aliasEl, 'QUALITY');
      const aliasName = this.getTextContent(aliasEl, 'ALIAS_NAME');
      if (aliasName) {
        aliases.push({
          id: index + 1,
          aliasName,
          quality: quality || null,
          originalRepresentation: null,
        });
      }
    });

    // Parse de data de nascimento
    let dateOfBirth: string | null = null;
    let datePrecision: 'EXACT' | 'YEAR_ONLY' | 'APPROXIMATE' | null = null;
    const dobElement = element.querySelector('INDIVIDUAL_DATE_OF_BIRTH');
    if (dobElement) {
      dateOfBirth = this.getTextContent(dobElement, 'DATE');
      const typeOfDate = this.getTextContent(dobElement, 'TYPE_OF_DATE');
      if (typeOfDate === 'EXACT') datePrecision = 'EXACT';
      else if (typeOfDate === 'YEAR') datePrecision = 'YEAR_ONLY';
      else if (typeOfDate === 'FROM' || typeOfDate === 'BETWEEN' || typeOfDate === 'UNIDENTIFIABLE') datePrecision = 'APPROXIMATE';
    }

    // Parse de local de nascimento
    let placeOfBirth: string | null = null;
    const pobElement = element.querySelector('INDIVIDUAL_PLACE_OF_BIRTH');
    if (pobElement) {
      const pobCountry = this.getTextContent(pobElement, 'COUNTRY');
      const pobCity = this.getTextContent(pobElement, 'CITY');
      const pobState = this.getTextContent(pobElement, 'STATE_PROVINCE');
      placeOfBirth = [pobCity, pobState, pobCountry]
        .filter(p => p && p.trim().length > 0)
        .join(', ');
      if (!placeOfBirth) placeOfBirth = null;
    }

    // Parse de nacionalidade
    let nationality: string | null = null;
    const natElement = element.querySelector('NATIONALITY');
    if (natElement) {
      nationality = this.getTextContent(natElement, 'VALUE');
    }

    // Parse de documentos
    const identificationDocuments: IdentificationDocument[] = [];
    const docElements = element.querySelectorAll('INDIVIDUAL_DOCUMENT');
    docElements.forEach((docEl) => {
      const type = this.getTextContent(docEl, 'TYPE_OF_DOCUMENT');
      const number = this.getTextContent(docEl, 'NUMBER');
      const issuingCountry = this.getTextContent(docEl, 'ISSUING_COUNTRY');
      if (type && number) {
        identificationDocuments.push({
          type,
          number,
          issuingCountry: issuingCountry || null,
          issueDate: null,
          expiryDate: null,
        });
      }
    });

    // Parse de endereços
    const addresses: string[] = [];
    const addrElements = element.querySelectorAll('INDIVIDUAL_ADDRESS');
    addrElements.forEach((addrEl) => {
      const country = this.getTextContent(addrEl, 'COUNTRY');
      const city = this.getTextContent(addrEl, 'CITY');
      const street = this.getTextContent(addrEl, 'STREET');
      const note = this.getTextContent(addrEl, 'NOTE');
      const address = [street, city, country].filter(a => a && a.trim().length > 0).join(', ');
      if (address) addresses.push(address);
      else if (note) addresses.push(note);
    });

    // Parse de programas de sanções
    const sanctionsPrograms: SanctionsProgram[] = [];
    if (unListType) {
      sanctionsPrograms.push({
        program: unListType,
        referenceInfo: referenceNumber || null,
        listingDetails: this.getTextContent(element, 'COMMENTS1') || null,
      });
    }

    // Last updated
    let lastUpdate: string | null = null;
    const lastUpdatedElements = element.querySelectorAll('LAST_DAY_UPDATED VALUE');
    if (lastUpdatedElements.length > 0) {
      lastUpdate = lastUpdatedElements[lastUpdatedElements.length - 1].textContent?.trim() || null;
    }

    const biographicalDetails: BiographicalDetail[] = [{
      dateOfBirth,
      datePrecision,
      placeOfBirth,
      nationality,
      gender: null, // ONU não fornece gênero diretamente
      identificationDocuments,
      addresses,
    }];

    return {
      id: this.generateId(dataId || referenceNumber),
      referenceNumber: referenceNumber || dataId,
      recordType: 'INDIVIDUAL',
      primaryName,
      listingDate: listedOn || null,
      lastUpdate,
      firstImported: new Date().toISOString(),
      lastSynchronized: new Date().toISOString(),
      sourceStatus: 'ACTIVE',
      sourceUrl: 'UN Security Council Consolidated List',
      aliases,
      biographicalDetails,
      sanctionsPrograms,
    };
  }

  /**
   * Parse de ENTITY no formato oficial ONU
   */
  private static parseUNEntity(element: Element): SanctionedRecord | null {
    const dataId = this.getTextContent(element, 'DATAID');
    const referenceNumber = this.getTextContent(element, 'REFERENCE_NUMBER');
    const listedOn = this.getTextContent(element, 'LISTED_ON');
    const unListType = this.getTextContent(element, 'UN_LIST_TYPE');

    const firstName = this.getTextContent(element, 'FIRST_NAME');
    const secondName = this.getTextContent(element, 'SECOND_NAME');
    const thirdName = this.getTextContent(element, 'THIRD_NAME');
    const fourthName = this.getTextContent(element, 'FOURTH_NAME');

    const primaryName = [firstName, secondName, thirdName, fourthName]
      .filter(n => n && n.trim().length > 0)
      .join(' ')
      .trim();

    if (!primaryName) return null;

    // Aliases
    const aliases: NameAlias[] = [];
    const aliasElements = element.querySelectorAll('ENTITY_ALIAS');
    aliasElements.forEach((aliasEl, index) => {
      const quality = this.getTextContent(aliasEl, 'QUALITY');
      const aliasName = this.getTextContent(aliasEl, 'ALIAS_NAME');
      if (aliasName) {
        aliases.push({
          id: index + 1,
          aliasName,
          quality: quality || null,
          originalRepresentation: null,
        });
      }
    });

    // Endereços
    const addresses: string[] = [];
    const addrElements = element.querySelectorAll('ENTITY_ADDRESS');
    addrElements.forEach((addrEl) => {
      const country = this.getTextContent(addrEl, 'COUNTRY');
      const city = this.getTextContent(addrEl, 'CITY');
      const street = this.getTextContent(addrEl, 'STREET');
      const address = [street, city, country].filter(a => a && a.trim().length > 0).join(', ');
      if (address) addresses.push(address);
    });

    // Programas
    const sanctionsPrograms: SanctionsProgram[] = [];
    if (unListType) {
      sanctionsPrograms.push({
        program: unListType,
        referenceInfo: referenceNumber || null,
        listingDetails: this.getTextContent(element, 'COMMENTS1') || null,
      });
    }

    const biographicalDetails: BiographicalDetail[] = [{
      dateOfBirth: null,
      datePrecision: null,
      placeOfBirth: null,
      nationality: null,
      gender: null,
      identificationDocuments: [],
      addresses,
    }];

    return {
      id: this.generateId(dataId || referenceNumber),
      referenceNumber: referenceNumber || dataId,
      recordType: 'ENTITY',
      primaryName,
      listingDate: listedOn || null,
      lastUpdate: null,
      firstImported: new Date().toISOString(),
      lastSynchronized: new Date().toISOString(),
      sourceStatus: 'ACTIVE',
      sourceUrl: 'UN Security Council Consolidated List',
      aliases,
      biographicalDetails,
      sanctionsPrograms,
    };
  }

  /**
   * Parse de individual no formato simplificado
   */
  private static parseSimpleIndividual(element: Element): SanctionedRecord | null {
    const id = element.getAttribute('id') || '';
    const dateListed = element.getAttribute('dateListed') || null;
    const lastUpdate = element.getAttribute('lastUpdate') || null;
    const primaryName = this.getTextContent(element, 'primaryName');
    
    if (!primaryName) return null;

    const aliases: NameAlias[] = [];
    element.querySelectorAll('alias').forEach((aliasEl, index) => {
      const aliasName = aliasEl.textContent?.trim() || '';
      const quality = aliasEl.getAttribute('quality') || null;
      if (aliasName) {
        aliases.push({ id: index + 1, aliasName, quality, originalRepresentation: null });
      }
    });

    const dateOfBirthEl = element.querySelector('dateOfBirth');
    const biographicalDetails: BiographicalDetail[] = [{
      dateOfBirth: dateOfBirthEl?.textContent?.trim() || null,
      datePrecision: (dateOfBirthEl?.getAttribute('precision') as any) || null,
      placeOfBirth: this.getTextContent(element, 'placeOfBirth') || null,
      nationality: this.getTextContent(element, 'nationality') || null,
      gender: this.getTextContent(element, 'gender') || null,
      identificationDocuments: [],
      addresses: Array.from(element.querySelectorAll('address'))
        .map(el => el.textContent?.trim() || '')
        .filter(t => t.length > 0),
    }];

    const sanctionsPrograms: SanctionsProgram[] = [];
    element.querySelectorAll('program').forEach((programEl) => {
      const program = programEl.getAttribute('name') || '';
      if (program) {
        sanctionsPrograms.push({
          program,
          referenceInfo: programEl.getAttribute('reference') || null,
          listingDetails: programEl.textContent?.trim() || null,
        });
      }
    });

    return {
      id: this.generateId(id),
      referenceNumber: id,
      recordType: 'INDIVIDUAL',
      primaryName,
      listingDate: dateListed,
      lastUpdate,
      firstImported: new Date().toISOString(),
      lastSynchronized: new Date().toISOString(),
      sourceStatus: 'ACTIVE',
      sourceUrl: 'Local XML File',
      aliases,
      biographicalDetails,
      sanctionsPrograms,
    };
  }

  /**
   * Parse de entity no formato simplificado
   */
  private static parseSimpleEntity(element: Element): SanctionedRecord | null {
    const id = element.getAttribute('id') || '';
    const dateListed = element.getAttribute('dateListed') || null;
    const lastUpdate = element.getAttribute('lastUpdate') || null;
    const primaryName = this.getTextContent(element, 'primaryName');
    
    if (!primaryName) return null;

    const aliases: NameAlias[] = [];
    element.querySelectorAll('alias').forEach((aliasEl, index) => {
      const aliasName = aliasEl.textContent?.trim() || '';
      const quality = aliasEl.getAttribute('quality') || null;
      if (aliasName) {
        aliases.push({ id: index + 1, aliasName, quality, originalRepresentation: null });
      }
    });

    const sanctionsPrograms: SanctionsProgram[] = [];
    element.querySelectorAll('program').forEach((programEl) => {
      const program = programEl.getAttribute('name') || '';
      if (program) {
        sanctionsPrograms.push({
          program,
          referenceInfo: programEl.getAttribute('reference') || null,
          listingDetails: programEl.textContent?.trim() || null,
        });
      }
    });

    const addresses = Array.from(element.querySelectorAll('address'))
      .map(el => el.textContent?.trim() || '')
      .filter(t => t.length > 0);

    return {
      id: this.generateId(id),
      referenceNumber: id,
      recordType: 'ENTITY',
      primaryName,
      listingDate: dateListed,
      lastUpdate,
      firstImported: new Date().toISOString(),
      lastSynchronized: new Date().toISOString(),
      sourceStatus: 'ACTIVE',
      sourceUrl: 'Local XML File',
      aliases,
      biographicalDetails: [{
        dateOfBirth: null, datePrecision: null, placeOfBirth: null,
        nationality: null, gender: null, identificationDocuments: [], addresses,
      }],
      sanctionsPrograms,
    };
  }

  /**
   * Obtém conteúdo de texto de um elemento filho
   */
  private static getTextContent(element: Element, tagName: string): string {
    const child = element.querySelector(tagName);
    return child?.textContent?.trim() || '';
  }

  /**
   * Gera ID numérico único
   */
  private static generateId(reference: string): number {
    let hash = 0;
    for (let i = 0; i < reference.length; i++) {
      const char = reference.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

/**
 * Carrega TODOS os arquivos XML da pasta archives/
 */
export async function loadAllSanctionsXML(): Promise<SanctionedRecord[]> {
  const allRecords: SanctionedRecord[] = [];
  const errors: string[] = [];

  try {
    // Lista de arquivos XML conhecidos (manifesto)
    // O frontend não pode listar diretórios, então usamos um manifesto
    const manifestResponse = await fetch('/archives/manifest.json');
    
    if (manifestResponse.ok) {
      const manifest = await manifestResponse.json();
      const files: string[] = manifest.files || [];
      
      for (const file of files) {
        try {
          const response = await fetch(`/archives/${file}`);
          if (response.ok) {
            const xmlContent = await response.text();
            const records = SanctionsXMLParser.parse(xmlContent);
            allRecords.push(...records);
          } else {
            errors.push(`Não foi possível carregar ${file}: HTTP ${response.status}`);
          }
        } catch (err) {
          errors.push(`Erro ao processar ${file}: ${err}`);
        }
      }
    } else {
      // Fallback: tentar carregar o arquivo padrão
      try {
        const response = await fetch('/archives/sanctions-list.xml');
        if (response.ok) {
          const xmlContent = await response.text();
          const records = SanctionsXMLParser.parse(xmlContent);
          allRecords.push(...records);
        }
      } catch (err) {
        errors.push(`Erro ao carregar arquivo padrão: ${err}`);
      }
    }
  } catch (err) {
    errors.push(`Erro ao carregar manifesto: ${err}`);
  }

  if (errors.length > 0) {
    console.warn('Avisos ao carregar XML:', errors);
  }

  return allRecords;
}

/**
 * Carrega um único arquivo XML (compatibilidade)
 */
export async function loadSanctionsXML(): Promise<SanctionedRecord[]> {
  return loadAllSanctionsXML();
}

/**
 * Valida se o conteúdo é um XML válido
 */
export function validateXML(xmlContent: string): boolean {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    const parseError = xmlDoc.querySelector('parsererror');
    return !parseError;
  } catch {
    return false;
  }
}

/**
 * Detecta o formato do XML
 */
export function detectXMLFormat(xmlContent: string): 'UN_OFFICIAL' | 'SIMPLE' | 'UNKNOWN' {
  if (xmlContent.includes('<INDIVIDUAL>') || xmlContent.includes('<ENTITY>')) {
    return 'UN_OFFICIAL';
  }
  if (xmlContent.includes('<individual>') || xmlContent.includes('<entity>')) {
    return 'SIMPLE';
  }
  return 'UNKNOWN';
}
