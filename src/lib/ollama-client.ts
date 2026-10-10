/**
 * Ollama API Client - Real AI Integration
 */

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  timeout: number;
  enabled: boolean;
}

export interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

export interface NameAnalysis {
  isLinguisticVariant: boolean;
  explanation: string;
  confidence: 'high' | 'medium' | 'low';
  supportingEvidence: string[];
  conflictingEvidence: string[];
  missingInformation: string[];
}

class OllamaClient {
  private config: OllamaConfig = {
    baseUrl: 'http://localhost:11434',
    model: 'qwen3:4b',
    timeout: 30000,
    enabled: true,
  };
  
  private available: boolean = false;
  private models: OllamaModel[] = [];

  async checkAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });
      
      if (response.ok) {
        const data = await response.json();
        this.models = data.models || [];
        this.available = this.models.length > 0;
        return this.available;
      }
      
      this.available = false;
      return false;
    } catch (error) {
      console.log('Ollama not available:', error);
      this.available = false;
      return false;
    }
  }

  async getAvailableModels(): Promise<OllamaModel[]> {
    await this.checkAvailability();
    return this.models;
  }

  isAvailable(): boolean {
    return this.available;
  }

  setModel(model: string): void {
    this.config.model = model;
  }

  getModel(): string {
    return this.config.model;
  }

  async analyzeNameMatch(
    searchedName: string,
    recordName: string,
    aliases: string[],
    score: number
  ): Promise<NameAnalysis | null> {
    if (!this.isAvailable()) return null;

    const prompt = this.buildPrompt(searchedName, recordName, aliases, score);

    try {
      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          prompt,
          stream: false,
        }),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        console.error('Ollama API error:', response.status);
        return null;
      }

      const data = await response.json();
      return this.parseResponse(data.response);
    } catch (error) {
      console.error('Ollama analysis failed:', error);
      return null;
    }
  }

  private buildPrompt(
    searchedName: string,
    recordName: string,
    aliases: string[],
    score: number
  ): string {
    const aliasesText = aliases.length > 0 
      ? `\nAlternative forms: ${aliases.join(', ')}`
      : '';

    return `You are a linguistic analysis system. Compare these two text strings:

String A: ${searchedName}
String B: ${recordName}${aliasesText}
Similarity Score: ${score}%

Analyze if these could be linguistic variants or transliterations.

Respond with valid JSON only:
{
  "isLinguisticVariant": true/false,
  "explanation": "brief explanation",
  "confidence": "high/medium/low",
  "supportingEvidence": ["factor1", "factor2"],
  "conflictingEvidence": ["factor1"],
  "missingInformation": ["info1"]
}`;
  }

  private parseResponse(responseText: string): NameAnalysis {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        isLinguisticVariant: parsed.isLinguisticVariant || false,
        explanation: parsed.explanation || 'Analysis unavailable',
        confidence: parsed.confidence || 'low',
        supportingEvidence: parsed.supportingEvidence || [],
        conflictingEvidence: parsed.conflictingEvidence || [],
        missingInformation: parsed.missingInformation || [],
      };
    } catch (error) {
      console.error('Parse error:', error);
      return {
        isLinguisticVariant: false,
        explanation: 'AI analysis failed',
        confidence: 'low',
        supportingEvidence: [],
        conflictingEvidence: [],
        missingInformation: ['Response parsing failed'],
      };
    }
  }

  updateConfig(config: Partial<OllamaConfig>): void {
    this.config = { ...this.config, ...config };
    this.available = false;
  }

  getConfig(): OllamaConfig {
    return { ...this.config };
  }
}

export const ollamaClient = new OllamaClient();
