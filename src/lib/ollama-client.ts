/**
 * Ollama API Client
 * Handles communication with local Ollama instance
 */

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  timeout: number;
  enabled: boolean;
}

export interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

export interface NameAnalysis {
  isLinguisticVariant: boolean;
  explanation: string;
  confidence: 'high' | 'medium' | 'low';
  supportingEvidence: string[];
  conflictingEvidence: string[];
  missingInformation: string[];
}

const DEFAULT_CONFIG: OllamaConfig = {
  baseUrl: 'http://localhost:11434',
  model: 'qwen3:4b',
  timeout: 30000,
  enabled: true,
};

class OllamaClient {
  private config: OllamaConfig;
  private available: boolean | null = null;

  constructor(config: Partial<OllamaConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if Ollama is available
   */
  async checkAvailability(): Promise<boolean> {
    if (!this.config.enabled) {
      this.available = false;
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const hasModel = data.models?.some((m: any) => m.name.includes(this.config.model));
        this.available = hasModel || true;
        return this.available === true;
      }

      this.available = false;
      return false;
    } catch (error) {
      console.log('Ollama not available:', error);
      this.available = false;
      return false;
    }
  }

  /**
   * Get cached availability status
   */
  isAvailable(): boolean {
    return this.available === true;
  }

  /**
   * Generate analysis for name comparison
   */
  async analyzeNameMatch(
    searchedName: string,
    recordName: string,
    aliases: string[],
    score: number
  ): Promise<NameAnalysis | null> {
    if (!this.isAvailable()) {
      return null;
    }

    const prompt = this.buildPrompt(searchedName, recordName, aliases, score);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt: prompt,
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data: OllamaResponse = await response.json();
      return this.parseResponse(data.response);
    } catch (error) {
      console.error('Ollama analysis failed:', error);
      return null;
    }
  }

  /**
   * Build prompt for name analysis
   */
  private buildPrompt(
    searchedName: string,
    recordName: string,
    aliases: string[],
    score: number
  ): string {
    const aliasesText = aliases.length > 0 
      ? `\nAliases: ${aliases.join(', ')}`
      : '';

    return `You are a linguistic expert analyzing name similarity for compliance purposes.

Analyze if these two names could be linguistic variants or transliterations of the same person:

Searched Name: ${searchedName}
Record Name: ${recordName}${aliasesText}
Similarity Score: ${score}%

Provide your analysis in this exact JSON format:
{
  "isLinguisticVariant": true/false,
  "explanation": "Brief explanation of your reasoning",
  "confidence": "high/medium/low",
  "supportingEvidence": ["list of supporting factors"],
  "conflictingEvidence": ["list of conflicting factors"],
  "missingInformation": ["list of missing info that would help"]
}

Consider:
- Common transliteration patterns (Arabic, Chinese, Cyrillic, etc.)
- Cultural naming conventions
- Phonetic similarities
- Character substitutions

Respond ONLY with valid JSON, no additional text.`;
  }

  /**
   * Parse Ollama response into structured analysis
   */
  private parseResponse(responseText: string): NameAnalysis {
    try {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
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
      console.error('Failed to parse Ollama response:', error);
      return {
        isLinguisticVariant: false,
        explanation: 'AI analysis failed to parse response',
        confidence: 'low',
        supportingEvidence: [],
        conflictingEvidence: [],
        missingInformation: ['AI response could not be parsed'],
      };
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<OllamaConfig>): void {
    this.config = { ...this.config, ...config };
    this.available = null; // Reset availability cache
  }

  /**
   * Get current configuration
   */
  getConfig(): OllamaConfig {
    return { ...this.config };
  }
}

// Singleton instance
export const ollamaClient = new OllamaClient();
