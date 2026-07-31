import { Box, Button, Container, HStack, Heading, Text } from "@chakra-ui/react"
import { Global } from "@emotion/react"
import { Printer } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { usePart9StepCode } from "../../../../../hooks/resources/use-part-9-step-code"
import { usePermitApplication } from "../../../../../hooks/resources/use-permit-application"
import { useMst } from "../../../../../setup/root"
import { EStepCodeType } from "../../../../../types/enums"
import { LoadingScreen } from "../../../../shared/base/loading-screen"
import { Part3PrintContent } from "./part-3-print-content"
import { Part9PrintContent } from "./part-9-print-content"

const printCss = `
  @media print {
    #mainNav, footer, [data-print-hide], .qa-tools-popout { display: none !important; }
    body { background: white !important; }
    .step-code-print { padding: 0 !important; }
    .chakra-collapse { height: auto !important; opacity: 1 !important; overflow: visible !important; display: block !important; }
  }
  .step-code-print [data-print-hide] { display: none !important; }
  @page { size: letter; margin: 0.5in; }
`

/** Loads MST data for logged-in users. Mount only when no print_token. */
const SessionPrintDataLoader = observer(function SessionPrintDataLoader() {
  const { stepCodeStore } = useMst()
  const { isOptionsLoaded, fetchPart9SelectOptions } = stepCodeStore

  usePermitApplication()
  usePart3StepCode()
  usePart9StepCode()

  useEffect(() => {
    if (!isOptionsLoaded) {
      fetchPart9SelectOptions()
    }
  }, [isOptionsLoaded, fetchPart9SelectOptions])

  return null
})

export const StepCodeChecklistPrintScreen = observer(function StepCodeChecklistPrintScreen() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const printToken = searchParams.get("print_token")
  const { stepCodeStore, permitApplicationStore, environment } = useMst()
  const { isOptionsLoaded, fetchPart9SelectOptions } = stepCodeStore
  const [tokenReady, setTokenReady] = useState(!printToken)
  const [tokenError, setTokenError] = useState<string | null>(null)

  useEffect(() => {
    if (!printToken) return
    let cancelled = false
    ;(async () => {
      try {
        const response = await environment.api.fetchPrintStepCodeChecklist(printToken)
        if (!response.ok) throw new Error(response.data?.error || "Failed to load print data")
        const { stepCode, checklist, permitApplication } = response.data.data
        const checklistWithLoaded = { ...checklist, isLoaded: true }
        const hydratedStepCode = {
          ...stepCode,
          isFullyLoaded: true,
          checklist: stepCode.type === EStepCodeType.part3StepCode ? checklistWithLoaded : stepCode.checklist,
          checklists: [checklistWithLoaded],
        }
        stepCodeStore.mergeUpdate(hydratedStepCode, "stepCodesMap")
        stepCodeStore.setCurrentStepCode(stepCode.id)
        if (permitApplication) {
          permitApplicationStore.mergeUpdate({ ...permitApplication, stepCode: stepCode.id }, "permitApplicationMap")
          permitApplicationStore.setCurrentPermitApplication(permitApplication.id)
        }
        if (!stepCodeStore.isOptionsLoaded) {
          await fetchPart9SelectOptions()
        }
        if (!cancelled) setTokenReady(true)
      } catch (e: any) {
        if (!cancelled) setTokenError(e?.message || "Print token failed")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [printToken])

  const currentStepCode = stepCodeStore.currentStepCode
  const checklist = currentStepCode?.currentChecklist || currentStepCode?.checklistForPdf
  const needsPart9Options =
    checklist?.stepCodeType === EStepCodeType.part9StepCode || currentStepCode?.type === EStepCodeType.part9StepCode

  useEffect(() => {
    if (!checklist || printToken) return
    if (typeof checklist.load === "function" && !checklist.isLoaded) {
      checklist.load()
    }
  }, [checklist?.id, checklist?.isLoaded, printToken])

  const ready = useMemo(() => {
    if (!tokenReady || tokenError) return false
    if (!currentStepCode || !checklist) return false
    if (!checklist.isLoaded) return false
    // Part 9 form sections read stepCodeStore.selectOptions (buildingTypes, etc.)
    if (needsPart9Options && !isOptionsLoaded) return false
    return true
  }, [tokenReady, tokenError, currentStepCode, checklist, checklist?.isLoaded, needsPart9Options, isOptionsLoaded])

  if (tokenError) {
    return (
      <Container py={10}>
        <Text color="semantic.error">{tokenError}</Text>
      </Container>
    )
  }

  return (
    <>
      {!printToken && <SessionPrintDataLoader />}
      {!ready ? (
        <LoadingScreen />
      ) : (
        <Box className="step-code-print" id="step-code-print-root" bg="white" minH="100vh">
          <Global styles={printCss} />
          <HStack
            data-print-hide
            justify="space-between"
            px={6}
            py={3}
            borderBottomWidth={1}
            borderColor="border.light"
            position="sticky"
            top={0}
            bg="white"
            zIndex={1}
          >
            <Heading as="h2" fontSize="md" mb={0}>
              {t("stepCode.print.heading")}
            </Heading>
            <Button leftIcon={<Printer />} size="sm" variant="primary" onClick={() => window.print()}>
              {t("stepCode.print.printOrSave")}
            </Button>
          </HStack>

          {checklist.stepCodeType === EStepCodeType.part9StepCode && <Part9PrintContent checklist={checklist as any} />}
          {checklist.stepCodeType === EStepCodeType.part3StepCode && (
            <Part3PrintContent stepCode={currentStepCode as any} checklist={checklist as any} />
          )}

          <Box id="print-ready" aria-hidden h={0} w={0} overflow="hidden" />
        </Box>
      )}
    </>
  )
})
