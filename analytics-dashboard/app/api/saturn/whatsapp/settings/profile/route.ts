import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getWhatsAppAPI } from "@/lib/whatsapp-api"

export async function GET() {
  try {
    const whatsapp = getWhatsAppAPI()
    const profile = await whatsapp.getBusinessProfile()
    return NextResponse.json(profile)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const profileData = await request.json()
    const whatsapp = getWhatsAppAPI()
    await whatsapp.updateBusinessProfile(profileData)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}
