import React from 'react'
import { useRouteError, isRouteErrorResponse } from 'react-router-dom'
import { ServerErrorPage } from '@/pages/error/ServerErrorPage'

export function GlobalErrorBoundary() {
  const error = useRouteError()

  let passError: Error | undefined
  
  if (error instanceof Error) {
    passError = error
  } else if (isRouteErrorResponse(error)) {
    passError = new Error(error.data?.message || error.statusText)
  } else if (typeof error === 'string') {
    passError = new Error(error)
  } else {
    passError = new Error('An unknown error occurred')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-primary, #fff)' }}>
      {/* Fallback minimal header for global crashes */}
      <header style={{ padding: '20px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
        <h2 style={{ margin: 0, color: 'var(--color-primary, #ff7596)' }}>CakePopRush</h2>
      </header>
      <main style={{ flex: 1 }}>
        <ServerErrorPage error={passError} />
      </main>
    </div>
  )
}
