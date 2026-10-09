import { SanctionedRecord, NameAlias, BiographicalDetail, SanctionsProgram, IdentificationDocument } from '../types';

/**
 * Parser para arquivo XML de lista de sanções
 */
export class SanctionsXMLParser {
  /**
   * Faz o parse do conteúdo XML e retorna array de registros
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

    // Processar indivíduos
    const individuals = xmlDoc.querySelectorAll('individual');
    individuals.forEach((individual) => {
      const record = this.parseIndividual(individual);
      records.push(record);
    });

    // Processar entidades
    const entities = xmlDoc.querySelectorAll('entity');
    entities.forEach((entity) => {
      const record = this.parseEntity(entity);
      records.push(record);
    });

    return records;
  }

  /**
   * Parse de um elemento individual
   */
  private static parseIndividual(element: Element): SanctionedRecord {
    const id = element.getAttribute('id') || '';
    const dateListed = element.getAttribute('dateListed') || null;
    const lastUpdate = element.getAttribute('lastUpdate') || null;

    const primaryName = this.getTextContent(element, 'primaryName');
    const aliases = this.parseAliases(element);
    const biographicalDetails = this.parseBiographicalDetails(element);
    const sanctionsPrograms = this.parsePrograms(element);

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
   * Parse de um elemento entity
   */
  private static parseEntity(element: Element): SanctionedRecord {
    const id = element.getAttribute('id') || '';
    const dateListed = element.getAttribute('dateListed') || null;
    const lastUpdate = element.getAttribute('lastUpdate') || null;

    const primaryName = this.getTextContent(element, 'primaryName');
    const aliases = this.parseAliases(element);
    const sanctionsPrograms = this.parsePrograms(element);

    // Entidades não têm dados biográficos completos
    const biographicalDetails: BiographicalDetail[] = [{
      dateOfBirth: null,
      datePrecision: null,
      placeOfBirth: null,
      nationality: null,
      gender: null,
      identificationDocuments: [],
      addresses: this.getMultipleTextContent(element, 'address'),
    }];

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
      biographicalDetails,
      sanctionsPrograms,
    };
  }

  /**
   * Parse de aliases
   */
  private static parseAliases(element: Element): NameAlias[] {
    const aliases: NameAlias[] = [];
    const aliasElements = element.querySelectorAll('alias');
    
    aliasElements.forEach((aliasEl, index) => {
      const aliasName = aliasEl.textContent?.trim() || '';
      const quality = aliasEl.getAttribute('quality') || null;
      
      if (aliasName) {
        aliases.push({
          id: index + 1,
          aliasName,
          quality,
          originalRepresentation: null,
        });
      }
    });

    return aliases;
  }

  /**
   * Parse de dados biográficos
   */
  private static parseBiographicalDetails(element: Element): BiographicalDetail[] {
    const dateOfBirthEl = element.querySelector('dateOfBirth');
    const placeOfBirth = this.getTextContent(element, 'placeOfBirth');
    const nationality = this.getTextContent(element, 'nationality');
    const gender = this.getTextContent(element, 'gender');
    const addresses = this.getMultipleTextContent(element, 'address');

    // Parse de documentos
    const identificationDocuments: IdentificationDocument[] = [];
    const docElements = element.querySelectorAll('document');
    docElements.forEach((docEl) => {
      const type = docEl.getAttribute('type') || '';
      const number = docEl.getAttribute('number') || '';
      const issuingCountry = docEl.getAttribute('issuingCountry') || null;
      
      if (type && number) {
        identificationDocuments.push({
          type,
          number,
          issuingCountry,
          issueDate: null,
          expiryDate: null,
        });
      }
    });

    return [{
      dateOfBirth: dateOfBirthEl?.textContent?.trim() || null,
      datePrecision: (dateOfBirthEl?.getAttribute('precision') as any) || null,
      placeOfBirth: placeOfBirth || null,
      nationality: nationality || null,
      gender: gender || null,
      identificationDocuments,
      addresses,
    }];
  }

  /**
   * Parse de programas de sanções
   */
  private static parsePrograms(element: Element): SanctionsProgram[] {
    const programs: SanctionsProgram[] = [];
    const programElements = element.querySelectorAll('program');
    
    programElements.forEach((programEl) => {
      const program = programEl.getAttribute('name') || '';
      const referenceInfo = programEl.getAttribute('reference') || null;
      const listingDetails = programEl.textContent?.trim() || null;
      
      if (program) {
        programs.push({
          program,
          referenceInfo,
          listingDetails,
        });
      }
    });

    return programs;
  }

  /**
   * Obtém conteúdo de texto de um elemento filho
   */
  private static getTextContent(element: Element, tagName: string): string {
    const child = element.querySelector(tagName);
    return child?.textContent?.trim() || '';
  }

  /**
   * Obtém múltiplos conteúdos de texto
   */
  private static getMultipleTextContent(element: Element, tagName: string): string[] {
    const elements = element.querySelectorAll(tagName);
    return Array.from(elements)
      .map(el => el.textContent?.trim() || '')
      .filter(text => text.length > 0);
  }

  /**
   * Gera ID numérico único
   */
  private static generateId(referenceNumber: string): number {
    // Hash simples da string referenceNumber
    let hash = 0;
    for (let i = 0; i < referenceNumber.length; i++) {
      const char = referenceNumber.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

/**
 * Carrega e faz o parse do arquivo XML de sanções
 */
export async function loadSanctionsXML(): Promise<SanctionedRecord[]> {
  try {
    const response = await fetch('/archives/sanctions-list.xml');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const xmlContent = await response.text();
    return SanctionsXMLParser.parse(xmlContent);
  } catch (error) {
    console.error('Erro ao carregar arquivo XML:', error);
    throw error;
  }
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
