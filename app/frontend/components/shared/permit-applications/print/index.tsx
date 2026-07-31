import { Box, Button, Container, HStack, Heading, Text, VStack } from "@chakra-ui/react"
import { Global } from "@emotion/react"
import { Printer } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { usePermitApplication } from "../../../../hooks/resources/use-permit-application"
import { useMst } from "../../../../setup/root"
import { LoadingScreen } from "../../base/loading-screen"
import { RequirementForm } from "../requirement-form"

const printCss = `
  @media print {
    #mainNav, footer, [data-print-hide], .qa-tools-popout { display: none !important; }
    body { background: white !important; }
    .permit-application-print { padding: 0 !important; }
  }
  .permit-application-print [data-print-hide] { display: none !important; }
  .permit-application-print .formio-component-button,
  .permit-application-print button:not(.print-allow) { display: none !important; }
  @page { size: letter; margin: 0.5in; }
`

const SessionLoader = observer(function SessionLoader() {
  usePermitApplication()
  return null
})

export const PermitApplicationPrintScreen = observer(function PermitApplicationPrintScreen() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const printToken = searchParams.get("print_token")
  const { permitApplicationStore, environment } = useMst()
  const formRef = useRef<any>(null)
  const [tokenReady, setTokenReady] = useState(!printToken)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [formSettled, setFormSettled] = useState(false)

  useEffect(() => {
    if (!printToken) return
    let cancelled = false
    ;(async () => {
      try {
        const response = await environment.api.fetchPrintPermitApplication(printToken)
        if (!response.ok) throw new Error(response.data?.error || "Failed to load print data")
        const permitApplication = response.data.data
        permitApplicationStore.mergeUpdate({ ...permitApplication, isFullyLoaded: true }, "permitApplicationMap")
        permitApplicationStore.setCurrentPermitApplication(permitApplication.id)
        if (!cancelled) setTokenReady(true)
      } catch (e: any) {
        if (!cancelled) setTokenError(e?.message || "Print token failed")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [printToken])

  const currentPermitApplication = permitApplicationStore.currentPermitApplication

  // FormIO needs a beat after mount before Chromium capture; watch for form root then delay briefly.
  useEffect(() => {
    if (!currentPermitApplication?.isFullyLoaded && !currentPermitApplication?.formattedFormJson) return
    setFormSettled(false)
    const started = Date.now()
    const id = window.setInterval(() => {
      const hasForm = !!document.querySelector(".formio-form")
      if (hasForm || Date.now() - started > 8000) {
        window.clearInterval(id)
        window.setTimeout(() => setFormSettled(true), hasForm ? 1500 : 0)
      }
    }, 200)
    return () => window.clearInterval(id)
  }, [currentPermitApplication?.id, currentPermitApplication?.formFormatKey])

  const ready = useMemo(() => {
    if (!tokenReady || tokenError) return false
    if (!currentPermitApplication) return false
    return !!(currentPermitApplication.formattedFormJson || currentPermitApplication.formJson)
  }, [tokenReady, tokenError, currentPermitApplication, currentPermitApplication?.formattedFormJson])

  if (tokenError) {
    return (
      <Container py={10}>
        <Text color="semantic.error">{tokenError}</Text>
      </Container>
    )
  }

  return (
    <>
      {!printToken && <SessionLoader />}
      {!ready ? (
        <LoadingScreen />
      ) : (
        <Box className="permit-application-print" bg="white" minH="100vh" px={4} py={6}>
          <Global styles={printCss} />
          <HStack
            data-print-hide
            justify="space-between"
            mb={6}
            pb={3}
            borderBottomWidth={1}
            borderColor="border.light"
            position="sticky"
            top={0}
            bg="white"
            zIndex={1}
          >
            <VStack align="start" spacing={0}>
              <Heading as="h1" fontSize="xl" mb={0}>
                {t("permitApplication.show.print.heading")}
              </Heading>
              <Text fontSize="sm" color="text.secondary">
                {currentPermitApplication.number}
              </Text>
            </VStack>
            <Button
              className="print-allow"
              leftIcon={<Printer />}
              size="sm"
              variant="primary"
              onClick={() => window.print()}
            >
              {t("permitApplication.show.print.printOrSave")}
            </Button>
          </HStack>

          <RequirementForm permitApplication={currentPermitApplication} formRef={formRef} readOnly />

          {formSettled && <Box id="print-ready" aria-hidden h={0} w={0} overflow="hidden" />}
        </Box>
      )}
    </>
  )
})
