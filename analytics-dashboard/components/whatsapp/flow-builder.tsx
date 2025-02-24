"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, Trash2 } from "lucide-react"

interface Trigger {
  type: string
  value: string
}

interface Action {
  type: string
  value: string
  delay?: number
}

interface Flow {
  name: string
  description: string
  triggers: Trigger[]
  actions: Action[]
}

export function FlowBuilder() {
  const [flow, setFlow] = useState<Flow>({
    name: "",
    description: "",
    triggers: [],
    actions: []
  })

  const addTrigger = () => {
    setFlow({
      ...flow,
      triggers: [...flow.triggers, { type: "keyword", value: "" }]
    })
  }

  const updateTrigger = (index: number, field: keyof Trigger, value: string) => {
    const newTriggers = [...flow.triggers]
    newTriggers[index] = { ...newTriggers[index], [field]: value }
    setFlow({ ...flow, triggers: newTriggers })
  }

  const removeTrigger = (index: number) => {
    const newTriggers = flow.triggers.filter((_, i) => i !== index)
    setFlow({ ...flow, triggers: newTriggers })
  }

  const addAction = () => {
    setFlow({
      ...flow,
      actions: [...flow.actions, { type: "message", value: "", delay: 0 }]
    })
  }

  const updateAction = (index: number, field: keyof Action, value: string | number) => {
    const newActions = [...flow.actions]
    newActions[index] = { ...newActions[index], [field]: value }
    setFlow({ ...flow, actions: newActions })
  }

  const removeAction = (index: number) => {
    const newActions = flow.actions.filter((_, i) => i !== index)
    setFlow({ ...flow, actions: newActions })
  }

  const saveFlow = async () => {
    try {
      const response = await fetch("/api/saturn/whatsapp/flows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flow)
      })

      if (!response.ok) {
        throw new Error("Failed to save flow")
      }

      // Reset form or show success message
      alert("Flow saved successfully!")
    } catch (error) {
      console.error("Error saving flow:", error)
      alert("Failed to save flow")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Automated Flow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Flow Name</Label>
            <Input
              id="name"
              value={flow.name}
              onChange={(e) => setFlow({ ...flow, name: e.target.value })}
              placeholder="e.g., Welcome Message Flow"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={flow.description}
              onChange={(e) => setFlow({ ...flow, description: e.target.value })}
              placeholder="Describe what this flow does..."
            />
          </div>
        </div>

        {/* Triggers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Triggers</h3>
            <Button onClick={addTrigger} variant="outline" size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Trigger
            </Button>
          </div>
          {flow.triggers.map((trigger, index) => (
            <div key={index} className="flex items-start space-x-4">
              <Select
                value={trigger.type}
                onValueChange={(value) => updateTrigger(index, "type", value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select trigger type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keyword">Keyword</SelectItem>
                  <SelectItem value="first_message">First Message</SelectItem>
                  <SelectItem value="button_click">Button Click</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={trigger.value}
                onChange={(e) => updateTrigger(index, "value", e.target.value)}
                placeholder="Trigger value"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTrigger(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Actions</h3>
            <Button onClick={addAction} variant="outline" size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Action
            </Button>
          </div>
          {flow.actions.map((action, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-start space-x-4">
                <Select
                  value={action.type}
                  onValueChange={(value) => updateAction(index, "type", value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select action type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="message">Send Message</SelectItem>
                    <SelectItem value="template">Send Template</SelectItem>
                    <SelectItem value="interactive">Send Interactive Message</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={action.delay}
                  onChange={(e) => updateAction(index, "delay", parseInt(e.target.value))}
                  placeholder="Delay (seconds)"
                  className="w-[150px]"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAction(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={action.value}
                onChange={(e) => updateAction(index, "value", e.target.value)}
                placeholder="Action content (message text, template name, etc.)"
              />
            </div>
          ))}
        </div>

        <Button onClick={saveFlow} className="w-full">
          Save Flow
        </Button>
      </CardContent>
    </Card>
  )
}
