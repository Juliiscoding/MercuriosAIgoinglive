import axios from 'axios'

export class WhatsAppAPI {
  private accessToken: string
  private phoneNumberId: string
  private apiVersion: string
  private baseUrl: string

  constructor(accessToken: string, phoneNumberId: string) {
    this.accessToken = accessToken
    this.phoneNumberId = phoneNumberId
    this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v19.0'
    this.baseUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com'
  }

  private async request(method: string, endpoint: string, data?: any) {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}/${this.apiVersion}${endpoint}`,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        data,
      })
      return response.data
    } catch (error: any) {
      throw new Error(`WhatsApp API Error: ${error.response?.data?.error?.message || error.message}`)
    }
  }

  // Message Templates
  async createMessageTemplate(template: {
    name: string
    language: string
    category: string
    components: any[]
  }) {
    return this.request('POST', `/${this.phoneNumberId}/message_templates`, template)
  }

  async getMessageTemplates() {
    return this.request('GET', `/${this.phoneNumberId}/message_templates`)
  }

  async deleteMessageTemplate(templateName: string) {
    return this.request('DELETE', `/${this.phoneNumberId}/message_templates`, {
      name: templateName
    })
  }

  // Messaging
  async sendTextMessage(to: string, text: string) {
    return this.request('POST', `/${this.phoneNumberId}/messages`, {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { body: text }
    })
  }

  async sendTemplateMessage(to: string, templateName: string, languageCode: string, components?: any[]) {
    return this.request('POST', `/${this.phoneNumberId}/messages`, {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: languageCode
        },
        components
      }
    })
  }

  async sendInteractiveMessage(to: string, interactive: any) {
    return this.request('POST', `/${this.phoneNumberId}/messages`, {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "interactive",
      interactive
    })
  }

  // Media Handling
  async uploadMedia(file: Buffer, type: string) {
    return this.request('POST', `/${this.phoneNumberId}/media`, {
      messaging_product: "whatsapp",
      file,
      type
    })
  }

  async sendMediaMessage(to: string, mediaType: string, mediaId: string, caption?: string) {
    return this.request('POST', `/${this.phoneNumberId}/messages`, {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: mediaType,
      [mediaType]: {
        id: mediaId,
        caption
      }
    })
  }

  // Business Profile
  async getBusinessProfile() {
    return this.request('GET', `/${this.phoneNumberId}/whatsapp_business_profile`)
  }

  async updateBusinessProfile(profile: {
    about?: string
    email?: string
    address?: string
    description?: string
    vertical?: string
  }) {
    return this.request('POST', `/${this.phoneNumberId}/whatsapp_business_profile`, profile)
  }

  // Contact Management
  async checkContactStatus(phoneNumbers: string[]) {
    return this.request('POST', '/contacts', {
      blocking: "wait",
      contacts: phoneNumbers,
      force_check: true
    })
  }

  // Analytics
  async getMessageStatistics(start: string, end: string) {
    return this.request('GET', `/${this.phoneNumberId}/message_metrics`, {
      start,
      end
    })
  }

  // Automated Flows
  async createFlow(flow: {
    name: string
    triggers: any[]
    actions: any[]
  }) {
    return this.request('POST', `/${this.phoneNumberId}/flows`, flow)
  }

  async getFlows() {
    return this.request('GET', `/${this.phoneNumberId}/flows`)
  }

  // Quick Replies
  async setQuickReplies(replies: string[]) {
    return this.request('POST', `/${this.phoneNumberId}/quick_replies`, {
      quick_replies: replies
    })
  }

  // Automated Messages
  async setWelcomeMessage(message: string) {
    return this.request('POST', `/${this.phoneNumberId}/welcome_message`, {
      message
    })
  }

  async setAwayMessage(message: string, schedule?: {
    start_time: string
    end_time: string
    timezone: string
  }) {
    return this.request('POST', `/${this.phoneNumberId}/away_message`, {
      message,
      schedule
    })
  }
}

export function getWhatsAppAPI() {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!accessToken || !phoneNumberId) {
    throw new Error('WhatsApp API credentials not configured')
  }

  return new WhatsAppAPI(accessToken, phoneNumberId)
}
