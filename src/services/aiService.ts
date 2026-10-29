/**
 * AI Service for Visual Circuits
 * Connects to larprouter / OpenAI-compatible endpoint
 */

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIModel {
  id: string;
  display_name?: string;
  context_window?: number;
}

export interface GeneratedCircuitDesign {
  projectName: string;
  description: string;
  board: string;
  code: string;
  bom: Array<{ component: string; quantity: number; notes: string }>;
  components: Array<{ definitionId: string; x: number; y: number; properties?: Record<string, any> }>;
  wires: Array<{ from: { componentId: string; pinId: string }; to: { componentId: string; pinId: string }; color: string }>;
  explanation: string;
}

class AIService {
  private apiKey: string = (import.meta as any).env?.VITE_AI_API_KEY || '';
  private baseUrl: string = '/api/ai/v1'; // Proxied through Vite, fallback to https://larprouter.com/v1
  private directUrl: string = 'https://larprouter.com/v1';
  public currentModel: string = 'glm-5.3-flash';

  constructor() {
    // Priority: localStorage -> Vite environment variable
    const envKey = (import.meta as any).env?.VITE_AI_API_KEY;
    const savedKey = localStorage.getItem('vc_ai_key');
    if (savedKey) {
      this.apiKey = savedKey;
    } else if (envKey) {
      this.apiKey = envKey;
    }

    const savedBase = localStorage.getItem('vc_ai_base');
    if (savedBase) this.baseUrl = savedBase;

    const savedModel = localStorage.getItem('vc_ai_model');
    if (savedModel) this.currentModel = savedModel;
  }

  public hasKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  public getMaskedKey(): string {
    return '••••••••••••••••••••••••••••••••';
  }

  public setApiKey(key: string) {
    if (key && key.trim()) {
      this.apiKey = key.trim();
      localStorage.setItem('vc_ai_key', this.apiKey);
    }
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.trim();
    localStorage.setItem('vc_ai_base', this.baseUrl);
  }

  public setModel(model: string) {
    this.currentModel = model;
    localStorage.setItem('vc_ai_model', model);
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'x-api-key': this.apiKey,
    };
  }

  /**
   * Fetch list of available models from endpoint
   */
  public async getModels(): Promise<AIModel[]> {
    const urls = [
      `${this.baseUrl}/models`,
      `${this.directUrl}/models`,
    ];

    for (const url of urls) {
      try {
        const resp = await fetch(url, {
          headers: this.getHeaders(),
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.data && Array.isArray(data.data)) {
            return data.data;
          }
        }
      } catch (err) {
        console.warn(`Failed to fetch models from ${url}, trying fallback...`, err);
      }
    }

    // Default fallback model list if offline
    return [
      { id: 'glm-5.3-flash', display_name: 'GLM 5.3 Flash (Recommended)' },
      { id: 'deepseek-v4.1-flash', display_name: 'DeepSeek V4.1 Flash' },
      { id: 'deepseek-v4.1-flash-fast', display_name: 'DeepSeek V4.1 Flash Fast' },
      { id: 'minimax-m3.1-flash', display_name: 'MiniMax M3.1 Flash' },
      { id: 'kimi-k3.1-pro', display_name: 'Kimi K3.1 Pro' },
      { id: 'qwen3.8-27b-non-abliterated', display_name: 'Qwen 3.8 27B' },
    ];
  }

  /**
   * Send a chat completion request to larprouter
   */
  public async chat(
    messages: AIMessage[],
    systemPrompt?: string,
    model?: string
  ): Promise<string> {
    const fullMessages: AIMessage[] = [];
    if (systemPrompt) {
      fullMessages.push({ role: 'system', content: systemPrompt });
    }
    fullMessages.push(...messages);

    const payload = {
      model: model || this.currentModel,
      messages: fullMessages,
      temperature: 0.7,
      max_tokens: 3000,
    };

    const endpoints = [
      `${this.baseUrl}/chat/completions`,
      `${this.directUrl}/chat/completions`,
    ];

    let lastError: any = null;

    for (const endpoint of endpoints) {
      try {
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload),
        });

        if (resp.ok) {
          const data = await resp.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            return content;
          }
        } else {
          const errText = await resp.text();
          lastError = new Error(`HTTP ${resp.status}: ${errText}`);
        }
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error('Failed to reach AI router. Check network or API key.');
  }

  /**
   * Generate complete circuit design from human description
   */
  public async generateCircuit(prompt: string): Promise<GeneratedCircuitDesign> {
    const systemPrompt = `You are the lead embedded electronics and hardware circuit architect for Visual Circuits (an exact Tinkered.ai simulator).
Given a user project prompt, generate an accurate electronic circuit design.

You MUST reply with ONLY a single valid, raw JSON object (no markdown quotes, no triple backticks).
The JSON MUST follow this exact TypeScript interface:
{
  "projectName": "Short Title",
  "description": "Technical summary of what the circuit does",
  "board": "arduino-uno",
  "bom": [
    { "component": "Arduino Uno R3", "quantity": 1, "notes": "Main ATmega328P microcontroller" },
    { "component": "Red 5mm LED", "quantity": 1, "notes": "Signal indicator" },
    { "component": "220 Ohm Resistor", "quantity": 1, "notes": "Current-limiting" },
    { "component": "Half Breadboard", "quantity": 1, "notes": "Prototyping ties" }
  ],
  "code": "// Complete Arduino C++ sketch\\nvoid setup() {\\n  pinMode(13, OUTPUT);\\n}\\nvoid loop() {\\n  digitalWrite(13, HIGH);\\n  delay(500);\\n  digitalWrite(13, LOW);\\n  delay(500);\\n}",
  "components": [
    { "definitionId": "arduino-uno", "x": 60, "y": 70 },
    { "definitionId": "breadboard-half", "x": 400, "y": 70 },
    { "definitionId": "led-red", "x": 480, "y": 140 },
    { "definitionId": "resistor-220", "x": 440, "y": 140 }
  ],
  "wires": [
    { "from": { "componentId": "comp-1", "pinId": "D13" }, "to": { "componentId": "comp-4", "pinId": "pin1" }, "color": "#f59e0b" },
    { "from": { "componentId": "comp-4", "pinId": "pin2" }, "to": { "componentId": "comp-3", "pinId": "anode" }, "color": "#10b981" },
    { "from": { "componentId": "comp-3", "pinId": "cathode" }, "to": { "componentId": "comp-1", "pinId": "GND1" }, "color": "#1f2937" }
  ],
  "explanation": "Brief explanation of how the circuit and C++ code work together."
}`;

    const rawResponse = await this.chat(
      [{ role: 'user', content: `Design this circuit: "${prompt}"` }],
      systemPrompt,
      this.currentModel
    );

    // Clean JSON if response has markdown blocks
    let cleaned = rawResponse.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
    }

    try {
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (parseErr) {
      console.error('Failed to parse AI JSON response:', cleaned);
      // Fallback fallback design
      return {
        projectName: prompt.slice(0, 32),
        description: prompt,
        board: 'arduino-uno',
        code: `// Circuit generated for: ${prompt}\nvoid setup() {\n  pinMode(13, OUTPUT);\n  Serial.begin(9600);\n  Serial.println("Visual Circuits Online");\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(500);\n  digitalWrite(13, LOW);\n  delay(500);\n}`,
        bom: [
          { component: 'Arduino Uno R3', quantity: 1, notes: 'Microcontroller' },
          { component: 'LED (Red)', quantity: 1, notes: 'Output indicator' },
          { component: 'Resistor 220Ω', quantity: 1, notes: 'Current limiting' }
        ],
        components: [
          { definitionId: 'arduino-uno', x: 80, y: 80 },
          { definitionId: 'breadboard-half', x: 420, y: 80 },
          { definitionId: 'led-red', x: 480, y: 150 },
          { definitionId: 'resistor-220', x: 440, y: 150 }
        ],
        wires: [
          { from: { componentId: 'comp-1', pinId: 'D13' }, to: { componentId: 'comp-4', pinId: 'pin1' }, color: '#3b82f6' },
          { from: { componentId: 'comp-4', pinId: 'pin2' }, to: { componentId: 'comp-3', pinId: 'anode' }, color: '#ef4444' },
          { from: { componentId: 'comp-3', pinId: 'cathode' }, to: { componentId: 'comp-1', pinId: 'GND1' }, color: '#18181b' }
        ],
        explanation: rawResponse,
      };
    }
  }
}

export const aiService = new AIService();

