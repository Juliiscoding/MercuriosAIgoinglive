"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"

interface SetupGuideProps {
  onComplete: () => void
}

export function WhatsAppSetupGuide({ onComplete }: SetupGuideProps) {
  const [accessToken, setAccessToken] = useState('')
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [businessAccountId, setBusinessAccountId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!accessToken || !phoneNumberId || !businessAccountId) {
      setError('All fields are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/saturn/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken,
          phoneNumberId,
          businessAccountId
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to configure WhatsApp')
      }

      onComplete()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>WhatsApp Business API Setup</CardTitle>
          <CardDescription>
            Configure your WhatsApp Business API credentials to get started.
            You can find these details in your Meta Business Manager account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessToken">Access Token</Label>
              <Input
                id="accessToken"
                type="password"
                placeholder="Enter your WhatsApp API access token"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumberId">Phone Number ID</Label>
              <Input
                id="phoneNumberId"
                placeholder="Enter your WhatsApp phone number ID"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessAccountId">Business Account ID</Label>
              <Input
                id="businessAccountId"
                placeholder="Enter your WhatsApp Business Account ID"
                value={businessAccountId}
                onChange={(e) => setBusinessAccountId(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Configuring...' : 'Configure WhatsApp'}
            </Button>

            <div className="text-sm text-muted-foreground">
              <p>Need help finding these details?</p>
              <ul className="list-disc list-inside mt-2">
                <li>
                  <a
                    href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    WhatsApp Cloud API Getting Started Guide
                  </a>
                </li>
                <li>
                  <a
                    href="https://business.facebook.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Meta Business Manager
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
