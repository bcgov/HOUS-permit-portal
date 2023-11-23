// organize-imports-ignore - otherwise, react import is removed

import { ChakraProvider } from "@chakra-ui/react"
import { Global } from "@emotion/react"
import { Navigation } from "../components/domains/navigation"
import { Provider, setupRootStore } from "../setup/root"
import { GlobalStyles } from "../styles"
import theme from "../styles/theme"
import React from "react"
import { setupReactotron } from "../setup/reactotron"
import { createRoot } from "react-dom/client"

const renderApp = (rootStore) => {
  const container = document.getElementById("app")
  const root = createRoot(container!)
  root.render(
    <ChakraProvider theme={theme}>
      <Provider value={rootStore}>
        <Global styles={GlobalStyles} />
        <Navigation />
      </Provider>
    </ChakraProvider>
  )
}

document.addEventListener("DOMContentLoaded", () => {
  const rootStore = setupRootStore()

  if (import.meta.env.PROD) {
    renderApp(rootStore)
  } else if (import.meta.env.DEV) {
    setupReactotron(rootStore.environment.api).then((reactotron) => {
      reactotron.trackMstNode(rootStore)
      // set reactotron into console
      window.console.tron = reactotron
      renderApp(rootStore)
    })
  }
})
