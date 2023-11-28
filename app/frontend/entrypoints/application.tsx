// organize-imports-ignore - otherwise, react import is removed

import "@bcgov/bc-sans/css/BC_Sans.css"
import { ChakraProvider, Flex } from "@chakra-ui/react"
import { Global } from "@emotion/react"
import { Navigation } from "../components/domains/navigation"
import { Provider, setupRootStore } from "../setup/root"
import { GlobalStyles } from "../styles"
import { theme } from "../styles/theme"
import React from "react"
import { setupReactotron } from "../setup/reactotron"
import { createRoot } from "react-dom/client"
import { useLanguageChange } from "../i18n/use-language-change"
import { NavBar } from "../components/domains/navigation/nav-bar"
import "../i18n/i18n"

const renderApp = (rootStore) => {
  const container = document.getElementById("app")
  const root = createRoot(container!)

  const RootComponent = () => {
    useLanguageChange()
    return (
      <ChakraProvider theme={theme}>
        <Provider value={rootStore}>
          <Global styles={GlobalStyles} />
          <Flex flexDirection="column" minH="100vh" className="outerFlex" bg="greys.grey03">
            <NavBar />
            <Navigation />
          </Flex>
        </Provider>
      </ChakraProvider>
    )
  }
  root.render(<RootComponent />)
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
