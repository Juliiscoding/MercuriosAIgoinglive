import { NextResponse } from "next/server"

const generateWhatsAppData = () => {
  return {
    inbox: {
      unread: 15,
      total: 156,
      messages: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        sender: `+1${Math.floor(Math.random() * 1000000000)}`,
        message: "Sample message content...",
        timestamp: new Date(Date.now() - i * 3600000).toISOString()
      }))
    },
    campaigns: {
      active: 3,
      completed: 12,
      scheduled: 5,
      campaigns: Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        name: `Campaign ${i + 1}`,
        status: ["active", "scheduled", "completed"][Math.floor(Math.random() * 3)],
        reach: Math.floor(Math.random() * 10000),
        engagement: Math.floor(Math.random() * 100)
      }))
    },
    audience: {
      total: 25678,
      active: 18945,
      growth: 12.5,
      segments: [
        { name: "Premium", count: 5678 },
        { name: "Regular", count: 15234 },
        { name: "Inactive", count: 4766 }
      ]
    },
    insights: {
      messagesSent: 156789,
      messagesDelivered: 154321,
      messagesRead: 138765,
      averageResponseTime: "2.5h",
      engagementRate: "87%"
    }
  }
}

export async function GET() {
  // In a real application, this would fetch from a database
  const whatsappData = generateWhatsAppData()
  return NextResponse.json(whatsappData)
}
