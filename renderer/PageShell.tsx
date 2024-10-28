import React from 'react'
import { PageContextProvider } from './usePageContext'
import { Provider } from 'react-redux'
import { createStore } from '../state/store'
import type { PageContext } from './types'
import './PageShell.css'

export { PageShell }

// const preloadedState = window.__PRELOADED_STATE__;

function PageShell({ children, pageContext }: { children: React.ReactNode; pageContext: PageContext }) {
  return (
    <React.StrictMode>
      <PageContextProvider pageContext={pageContext}>
        <Provider store={createStore()}>
          {children}
        </Provider>
      </PageContextProvider>
    </React.StrictMode>
  )
}