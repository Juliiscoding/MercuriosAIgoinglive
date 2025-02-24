import { NextResponse } from "next/server"
import { getWhatsAppAPI } from "@/lib/whatsapp-api"

export async function GET() {
  try {
    const whatsapp = getWhatsAppAPI()
    const flows = await whatsapp.getFlows()
    return NextResponse.json(flows)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const flowData = await request.json()
    const whatsapp = getWhatsAppAPI()
    const result = await whatsapp.createFlow(flowData)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}
