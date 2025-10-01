import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Identity } from 'spacetimedb'
import { SpacetimeDBProvider } from 'spacetimedb/react'
import { DbConnection, type ErrorContext } from './module_bindings'
import './index.css'
import App from './App.tsx'

const onConnect = (conn: DbConnection, identity: Identity, token: string) => {
  localStorage.setItem('auth_token', token)
}

const onDisconnect = () => {
  console.log('Disconnected from SpacetimeDB')
}

const onConnectError = (_ctx: ErrorContext, err: Error) => {
  console.log('Error connecting to SpacetimeDB:', err)
}

const existingToken = localStorage.getItem('auth_token')

const getSpacetimeUri = () => {
  if (import.meta.env.VITE_SPACETIME_URI) {
    return import.meta.env.VITE_SPACETIME_URI
  }

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'ws://localhost:3000'
  }

  return `ws://${window.location.hostname}:3000`
}

const connectionBuilder = DbConnection.builder()
  .withUri(getSpacetimeUri())
  .withModuleName('spacetime-demo')
  .withToken(existingToken || undefined)
  .onConnect(onConnect)
  .onDisconnect(onDisconnect)
  .onConnectError(onConnectError)

createRoot(document.getElementById('root')!).render(
  <SpacetimeDBProvider connectionBuilder={connectionBuilder}>
    <App />
  </SpacetimeDBProvider>
)
