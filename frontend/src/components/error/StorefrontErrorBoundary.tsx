import React from 'react'
import { useRouteError, isRouteErrorResponse } from 'react-router-dom'
import { ServerErrorPage } from '@/pages/error/ServerErrorPage'

export function StorefrontErrorBoundary() {
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

  return <ServerErrorPage error={passError} />
}
