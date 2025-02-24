'use client'

import { useEffect, useState } from 'react'
import { RealtimeService } from '@/services/realtimeService'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ConnectionState = {
  connected: boolean
  error: string | null
  attempts: number
}

export function ConnectionStatus() {
  const [state, setState] = useState<ConnectionState>({
    connected: false,
    error: null,
    attempts: 0
  })

  useEffect(() => {
    const realtime = RealtimeService.getInstance()

    const unsubscribe = realtime.subscribeToConnection((connected, error, attempts = 0) => {
      setState({
        connected,
        error: error || null,
        attempts
      })
    })

    return () => unsubscribe()
  }, [])

  const handleManualReconnect = () => {
    const realtime = RealtimeService.getInstance()
    realtime.reconnect()
  }

  if (state.connected) {
    return (
      <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertTitle>Connected to ProHandel API</AlertTitle>
        <AlertDescription>
          Real-time updates are active
        </AlertDescription>
      </Alert>
    )
  }

  if (state.attempts > 0) {
    return (
      <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <WifiOff className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertTitle>Reconnecting...</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>
            Attempt {state.attempts}/5: {state.error}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualReconnect}
            className="ml-4"
          >
            Try Now
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Connection Error</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{state.error || 'Failed to connect to ProHandel API'}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualReconnect}
          className="ml-4 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40"
        >
          Reconnect
        </Button>
      </AlertDescription>
    </Alert>
  )
}
