"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Edit, Trash } from "lucide-react"

interface Template {
  id: string
  name: string
  language: string
  status: string
  category: string
  components: any[]
}

export function TemplatesPanel() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    language: 'en',
    category: 'MARKETING',
    components: [{ type: 'BODY', text: '' }]
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/saturn/whatsapp/templates')
      const data = await response.json()
      setTemplates(data.templates)
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/saturn/whatsapp/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) throw new Error('Failed to create template')
      
      await fetchTemplates()
      setShowForm(false)
      setFormData({
        name: '',
        language: 'en',
        category: 'MARKETING',
        components: [{ type: 'BODY', text: '' }]
      })
    } catch (error) {
      console.error('Error creating template:', error)
    }
  }

  if (loading) {
    return <div>Loading templates...</div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Message Templates</CardTitle>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </CardHeader>
        <CardContent>
          {showForm ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="welcome_message"
                />
              </div>
              <div>
                <Label htmlFor="body">Message Body</Label>
                <Textarea
                  id="body"
                  value={formData.components[0].text}
                  onChange={(e) => setFormData({
                    ...formData,
                    components: [{ ...formData.components[0], text: e.target.value }]
                  })}
                  placeholder="Hello {{1}}, welcome to our service!"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSubmit}>Save Template</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {templates.map((template) => (
                  <Card key={template.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {template.category} • {template.language} • {template.status}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
