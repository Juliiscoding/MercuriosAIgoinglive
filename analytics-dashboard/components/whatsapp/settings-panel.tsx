"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"

interface BusinessProfile {
  about: string
  email: string
  address: string
  description: string
  vertical: string
}

interface WebhookConfig {
  url: string
  enabled: boolean
}

export function SettingsPanel() {
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    about: '',
    email: '',
    address: '',
    description: '',
    vertical: ''
  })
  const [webhook, setWebhook] = useState<WebhookConfig>({
    url: '',
    enabled: false
  })
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const [profileResponse, webhookResponse] = await Promise.all([
        fetch('/api/saturn/whatsapp/settings/profile'),
        fetch('/api/saturn/whatsapp/settings/webhook')
      ])
      
      const profileData = await profileResponse.json()
      const webhookData = await webhookResponse.json()
      
      setBusinessProfile(profileData)
      setWebhook(webhookData)
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateBusinessProfile = async () => {
    try {
      const response = await fetch('/api/saturn/whatsapp/settings/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessProfile)
      })

      if (!response.ok) throw new Error('Failed to update business profile')
      
      setSuccess('Business profile updated successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error: any) {
      setError(error.message)
      setTimeout(() => setError(''), 3000)
    }
  }

  const updateWebhook = async () => {
    try {
      const response = await fetch('/api/saturn/whatsapp/settings/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhook)
      })

      if (!response.ok) throw new Error('Failed to update webhook configuration')
      
      setSuccess('Webhook configuration updated successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error: any) {
      setError(error.message)
      setTimeout(() => setError(''), 3000)
    }
  }

  if (loading) {
    return <div>Loading settings...</div>
  }

  return (
    <div className="space-y-4">
      {success && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Business Profile</TabsTrigger>
          <TabsTrigger value="webhook">Webhook</TabsTrigger>
          <TabsTrigger value="api">API Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Business Profile</CardTitle>
              <CardDescription>
                Update your WhatsApp Business profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="about">About</Label>
                <Input
                  id="about"
                  value={businessProfile.about}
                  onChange={(e) => setBusinessProfile({ ...businessProfile, about: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Business Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={businessProfile.email}
                  onChange={(e) => setBusinessProfile({ ...businessProfile, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Input
                  id="address"
                  value={businessProfile.address}
                  onChange={(e) => setBusinessProfile({ ...businessProfile, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Input
                  id="description"
                  value={businessProfile.description}
                  onChange={(e) => setBusinessProfile({ ...businessProfile, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vertical">Business Category</Label>
                <Input
                  id="vertical"
                  value={businessProfile.vertical}
                  onChange={(e) => setBusinessProfile({ ...businessProfile, vertical: e.target.value })}
                />
              </div>
              <Button onClick={updateBusinessProfile}>Save Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhook">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>
                Configure webhook to receive real-time updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  value={webhook.url}
                  onChange={(e) => setWebhook({ ...webhook, url: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="webhook-status"
                  checked={webhook.enabled}
                  onCheckedChange={(checked) => setWebhook({ ...webhook, enabled: checked })}
                />
                <Label htmlFor="webhook-status">Enable Webhook</Label>
              </div>
              <Button onClick={updateWebhook}>Save Webhook Configuration</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                View and manage your WhatsApp API configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Phone Number ID</Label>
                <div className="text-sm text-muted-foreground">
                  Your WhatsApp Business Phone Number ID
                </div>
                <code className="block p-2 bg-secondary rounded">
                  {process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID || 'Not configured'}
                </code>
              </div>
              <div className="space-y-2">
                <Label>Business Account ID</Label>
                <div className="text-sm text-muted-foreground">
                  Your WhatsApp Business Account ID
                </div>
                <code className="block p-2 bg-secondary rounded">
                  {process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_ID || 'Not configured'}
                </code>
              </div>
              <Button variant="outline" onClick={() => window.location.href = '/saturn/whatsapp/setup'}>
                Reconfigure API Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
