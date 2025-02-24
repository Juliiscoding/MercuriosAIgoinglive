import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// In a real application, this would be stored in a database
let webhookConfig = {
  url: '',
  enabled: false
}

export async function GET() {
  return NextResponse.json(webhookConfig)
}

export async function POST(request: Request) {
  try {
    const config = await request.json()
    
    // Validate webhook URL
    if (config.url && !isValidUrl(config.url)) {
      throw new Error('Invalid webhook URL')
    }

    // Update webhook configuration
    webhookConfig = {
      url: config.url,
      enabled: config.enabled
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}

function isValidUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
