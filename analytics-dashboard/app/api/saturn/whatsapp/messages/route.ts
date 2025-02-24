import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getWhatsAppAPI } from "@/lib/whatsapp-api"

// In-memory message store (replace with database in production)
let messages: any[] = []

export async function GET() {
  return NextResponse.json({ messages })
}

export async function POST(request: Request) {
  try {
    const { to, message } = await request.json()

    const whatsapp = getWhatsAppAPI()
    const result = await whatsapp.sendTextMessage(to, message)

    // Store the message
    const newMessage = {
      id: result.messages[0].id,
      type: 'outgoing',
      content: message,
      timestamp: new Date().toISOString(),
      status: 'sent'
    }
    messages.push(newMessage)

    return NextResponse.json({ success: true, message: newMessage })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
}

// Webhook handler for incoming messages
export async function PUT(request: Request) {
  try {
    const payload = await request.json()

    // Process incoming message
    if (payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const message = payload.entry[0].changes[0].value.messages[0]
      
      const newMessage = {
        id: message.id,
        type: 'incoming',
        content: message.text.body,
        timestamp: new Date().toISOString()
      }
      messages.push(newMessage)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
}
