import "@bcgov/bc-sans/css/BC_Sans.css"
import { ChakraProvider, Flex } from "@chakra-ui/react"
import { Global } from "@emotion/react"
import React from "react"
import { createRoot } from "react-dom/client"
import { Helmet } from "react-helmet"
import { Navigation } from "../components/domains/navigation"
import "../i18n/i18n"
import { useLanguageChange } from "../i18n/use-language-change"
import { setupReactotron } from "../setup/reactotron"
import { Provider, setupRootStore } from "../setup/root"
import { GlobalStyles } from "../styles"
import { theme } from "../styles/theme"

import { useTranslation } from "react-i18next"
import "../i18n/i18n"

const renderApp = (rootStore) => {
  const container = document.getElementById("app")
  const root = createRoot(container!)

  const RootComponent = () => {
    useLanguageChange()
    const { t } = useTranslation()

    return (
      <ChakraProvider theme={theme}>
        <Provider value={rootStore}>
          <Global styles={GlobalStyles} />
          <Helmet>
            <title>{t("site.title")}</title>
            <meta name="description" content={t("site.metaDescription")} />
            <meta name="keywords" content={t("site.metaKeywords")} />
            <meta property="og:title" content={t("site.title")} />
            <meta property="og:description" content={t("site.metaDescription")} />
            <meta property="og:image" content="/images/logo.svg" />
          </Helmet>
          <Flex direction="column" minH="100vh">
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
      // @ts-ignore
      reactotron.trackMstNode(rootStore)
      // set reactotron into console
      window.console.tron = reactotron
      renderApp(rootStore)
    })
  }
})
