import React from 'react'
import { PageContextProvider } from './usePageContext'
import { Provider } from 'react-redux'
import { store } from '../state/store'
import type { PageContext } from './types'
import './PageShell.css'

export { PageShell }

function PageShell({ children, pageContext }: { children: React.ReactNode; pageContext: PageContext }) {
  return (
    <React.StrictMode>
      <PageContextProvider pageContext={pageContext}>
        <Provider store={store}>
          {children}
        </Provider>
      </PageContextProvider>
    </React.StrictMode>
  )
}