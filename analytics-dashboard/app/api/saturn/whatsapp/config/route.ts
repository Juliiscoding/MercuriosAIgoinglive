import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { initializeWhatsAppAPI } from "@/lib/whatsapp-api"

export async function POST(request: Request) {
  try {
    const { accessToken, phoneNumberId, businessAccountId } = await request.json()

    // Validate credentials with WhatsApp API
    const api = initializeWhatsAppAPI(accessToken, phoneNumberId)
    await api.getBusinessProfile() // This will throw if credentials are invalid

    // Store credentials securely (in a real app, use a secure vault service)
    const response = NextResponse.json({ success: true })
    response.cookies.set("whatsapp_config", JSON.stringify({
      accessToken,
      phoneNumberId,
      businessAccountId
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })

    return response
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
}

export async function GET() {
  const cookieStore = cookies()
  const config = cookieStore.get("whatsapp_config")
  
  if (!config) {
    return NextResponse.json({ configured: false })
  }

  try {
    const { accessToken, phoneNumberId } = JSON.parse(config.value)
    const api = initializeWhatsAppAPI(accessToken, phoneNumberId)
    await api.getBusinessProfile()
    return NextResponse.json({ configured: true })
  } catch {
    return NextResponse.json({ configured: false })
  }
}
