"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  type: 'incoming' | 'outgoing'
  content: string
  timestamp: string
  status?: 'sent' | 'delivered' | 'read'
}

export function MessagingPanel() {
  const [messages, setMessages] = useState<Message[]>([])
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/saturn/whatsapp/messages')
      const data = await response.json()
      setMessages(data.messages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!phoneNumber || !message) return

    setLoading(true)
    try {
      const response = await fetch('/api/saturn/whatsapp/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phoneNumber,
          message: message
        })
      })

      if (!response.ok) throw new Error('Failed to send message')

      // Add message to list
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'outgoing',
        content: message,
        timestamp: new Date().toISOString(),
        status: 'sent'
      }])

      // Clear input
      setMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Send Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <Button 
            onClick={sendMessage} 
            disabled={loading || !phoneNumber || !message}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </Button>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Message History</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg ${
                    msg.type === 'incoming' 
                      ? 'bg-secondary ml-4' 
                      : 'bg-primary text-primary-foreground mr-4'
                  }`}
                >
                  <p>{msg.content}</p>
                  <div className="text-xs mt-1 opacity-70">
                    {new Date(msg.timestamp).toLocaleString()}
                    {msg.status && ` • ${msg.status}`}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
