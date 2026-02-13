
export class GeminiService {
  private apiUrl: string | null = null;
  private apiKey: string | null = null;
  private apiModel: string | null = null;

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    this.apiUrl = localStorage.getItem('api_url');
    this.apiKey = localStorage.getItem('api_key');
    this.apiModel = localStorage.getItem('api_model');

    if (!this.apiUrl || !this.apiKey || !this.apiModel) {
      console.warn("API configuration is incomplete. Please configure it in Settings.");
    }
  }

  // Method to reinitialize with new API configuration
  public reinitialize() {
    this.loadConfig();
  }

  async generateVariant(baseContent: string, prompt: string): Promise<string> {
    if (!this.apiUrl || !this.apiKey || !this.apiModel) {
      throw new Error("API未配置，请先在设置中配置API信息");
    }

    // 使用代理来避免CORS问题
    let requestUrl = this.apiUrl;
    if (this.apiUrl.includes('mg.aid.pub')) {
      // 将mg.aid.pub的URL转换为使用本地代理
      requestUrl = this.apiUrl.replace('https://mg.aid.pub', '/api-proxy');
    }

    try {
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.apiModel,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that transforms content based on user instructions. Always provide output in clean Markdown format.'
            },
            {
              role: 'user',
              content: `CONTEXT:\n${baseContent}\n\nINSTRUCTION:\n${prompt}\n\nProvide the output in clean Markdown format only.`
            }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // 处理OpenAI格式的响应
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content || "生成内容为空";
      }

      throw new Error("API响应格式不正确");
    } catch (error) {
      console.error("API Error:", error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('网络请求失败，可能是CORS跨域问题。请检查：1) API URL是否正确 2) 网络连接是否正常 3) 是否需要配置代理');
      }
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
