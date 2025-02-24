"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FlowBuilder } from "@/components/whatsapp/flow-builder"
import { 
  MessageSquare, 
  Users, 
  Archive, 
  AlertCircle,
  ChevronDown,
  Search,
  Filter,
  Plus,
  Settings,
  Bot
} from "lucide-react"

interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
  platform: 'whatsapp' | 'instagram' | 'facebook'
  status: 'read' | 'unread'
}

export default function MessagingDashboard() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'Nora',
      content: 'Hallo liebes Schlier Team! Über eine Beskreib...',
      timestamp: 'Yesterday',
      platform: 'instagram',
      status: 'unread'
    },
    {
      id: '2',
      sender: 'Klara Zoltk',
      content: 'Hallo! Ich bin total begeistert und möchte g...',
      timestamp: 'Tuesday',
      platform: 'instagram',
      status: 'read'
    },
    {
      id: '3',
      sender: 'Schlieren Verwaltung',
      content: 'Guten Tag und herzlich Willkommen! Wir freu...',
      timestamp: 'Tuesday',
      platform: 'whatsapp',
      status: 'read'
    }
  ])

  const [activeTab, setActiveTab] = useState('messages')

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <div className="w-64 border-r flex flex-col">
        <div className="p-4">
          <Button className="w-full bg-primary" size="lg">
            <Plus className="mr-2 h-4 w-4" />
            New message
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">Favorites</h2>
            <div className="space-y-1">
              <Button 
                variant={activeTab === 'messages' ? 'secondary' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('messages')}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                All Messages
              </Button>
              <Button variant="ghost" className="w-full justify-between">
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Assigned to me
                </div>
                <Badge>0</Badge>
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <AlertCircle className="mr-2 h-4 w-4" />
                Assignable
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Archive className="mr-2 h-4 w-4" />
                Archived
              </Button>
            </div>

            <h2 className="mt-6 mb-2 px-4 text-lg font-semibold">Teams</h2>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-between text-left">
                <span>Allgemein</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
              <div className="ml-4 space-y-1">
                <Button variant="ghost" className="w-full justify-between">
                  <span>Facebook</span>
                  <Badge>0</Badge>
                </Button>
                <Button variant="ghost" className="w-full justify-between">
                  <span>Instagram</span>
                  <Badge>2</Badge>
                </Button>
                <Button variant="ghost" className="w-full justify-between">
                  <span>WhatsApp</span>
                  <Badge>4</Badge>
                </Button>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <Button 
                variant={activeTab === 'automation' ? 'secondary' : 'ghost'}
                className="w-full justify-between"
                onClick={() => setActiveTab('automation')}
              >
                <div className="flex items-center">
                  <Bot className="mr-2 h-4 w-4" />
                  <span>Automation</span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button 
                variant={activeTab === 'settings' ? 'secondary' : 'ghost'}
                className="w-full justify-between"
                onClick={() => setActiveTab('settings')}
              >
                <div className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'messages' && (
          <>
            <div className="border-b">
              <div className="flex items-center p-4 gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search" className="pl-8" />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="open" className="flex-1">
              <div className="border-b px-4">
                <TabsList>
                  <TabsTrigger value="open">Open</TabsTrigger>
                  <TabsTrigger value="closed">Closed</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="open" className="flex-1 p-0">
                <ScrollArea className="h-full">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="border-b p-4 hover:bg-accent cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium">{message.sender}</div>
                        <div className="text-sm text-muted-foreground">
                          {message.timestamp}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {message.content}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline">
                          {message.platform}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="closed" className="flex-1 p-4">
                <div className="text-center text-muted-foreground">
                  No closed conversations
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}

        {activeTab === 'automation' && (
          <div className="p-6">
            <FlowBuilder />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">WhatsApp Business Settings</h2>
            {/* Add settings content here */}
          </div>
        )}
      </div>

      {/* Right Panel (Empty State) */}
      <div className="w-[600px] border-l bg-muted/10 flex items-center justify-center text-center p-8">
        <div className="max-w-sm">
          <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
          <p className="text-muted-foreground">
            Choose a conversation from the list to start chatting with your customers.
          </p>
        </div>
      </div>
    </div>
  )
}
