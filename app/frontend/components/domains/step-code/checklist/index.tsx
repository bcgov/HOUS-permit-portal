import { Accordion, Alert, Center, Container, HStack, Heading, Tag, VStack } from "@chakra-ui/react"
import { LightningA } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { Suspense, useEffect, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../../setup/root"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { BuildingCharacteristicsSummary } from "./building-characteristics-summary"
import { CompletedBy } from "./completed-by"
import { ComplianceSummary } from "./compliance-summary"
import { EnergyPerformanceCompliance } from "./energy-performance-compliance"
import { EnergyStepCodeCompliance } from "./energy-step-code-compliance"
import { ProjectInfo } from "./project-info"
import { StepNotMetWarning } from "./shared/step-not-met-warning"
import { ZeroCarbonStepCodeCompliance } from "./zero-carbon-step-code-compliance"

export const StepCodeChecklistForm = observer(function StepCodeChecklistForm() {
  const {
    stepCodeStore: { currentStepCode: stepCode },
  } = useMst()
  const checklist = stepCode.preConstructionChecklist
  const navigate = useNavigate()
  const [index, setIndex] = useState([0, 1, 2, 3, 4])
  const [scrollRef, setScrollRef] = useState<null | HTMLDivElement>()
  const energyComplianceRef = useRef<null | HTMLDivElement>()
  const zeroCarbonComplianceRef = useRef<null | HTMLDivElement>()

  useEffect(() => {
    const fetch = async () => await checklist.load()
    !checklist.isLoaded && fetch()
  }, [checklist.isLoaded])

  useEffect(() => {
    checklist?.isLoaded && reset(checklist.defaultFormValues)
  }, [checklist?.isLoaded])

  const formMethods = useForm({ mode: "onChange" })
  const { handleSubmit, reset } = formMethods

  const onSubmit = async (values) => {
    const result = await stepCode.updateStepCodeChecklist(
      checklist.id,
      R.mergeRight(values, { stepRequirementId: checklist.stepRequirementId })
    )
    if (result) navigate(-1)
  }

  const i18nPrefix = "stepCodeChecklist.edit"

  const scrollToEnergyCompliance = () => scrollToRef(energyComplianceRef.current, 5)
  const scrollToZeroCarbonCompliance = () => scrollToRef(zeroCarbonComplianceRef.current, 6)

  const scrollToRef = (ref, refIndex) => {
    if (!ref) return
    setScrollRef(ref)
    // expand the accordion if needed
    if (!R.includes(refIndex, index)) {
      setIndex([...index, refIndex])
    }
  }

  useEffect(() => {
    if (!scrollRef) return

    // timeout to allow for accordion transition to complete so scroll position can be determined accurately
    setTimeout(() => {
      const yOffset = document.getElementById("stepCodeNav")?.offsetHeight + 20
      const scrollParent = document.getElementById("stepCodeScroll")
      const y = scrollRef.getBoundingClientRect().top + scrollParent.scrollTop - yOffset

      scrollParent.scrollTo({ top: y, behavior: "smooth" })

      setScrollRef(null)
    }, 200)
  }, [index, scrollRef])

  return (
    <Suspense
      fallback={
        <Center p={50}>
          <SharedSpinner />
        </Center>
      }
    >
      {checklist?.isLoaded && (
        <Container my={10} maxW="780px" px={0}>
          <VStack gap={8} align="stretch">
            <HStack spacing={5}>
              <Heading fontSize="2xl" mb={0} color="text.primary">
                {t(`${i18nPrefix}.heading`)}
              </Heading>
              <Tag
                p={1}
                bg={checklist.isComplete ? "theme.blue" : "greys.grey03"}
                color={checklist.isComplete ? "greys.white" : "text.primary"}
                fontWeight="bold"
                border="1px solid"
                borderColor="border.base"
                textTransform="uppercase"
                minW="fit-content"
              >
                {checklist.status}
              </Tag>
            </HStack>
            <VStack spacing={2}>
              {R.isNil(checklist.selectedReport.energy.proposedStep) && (
                <StepNotMetWarning i18nKey="energyStepNotMet" scrollToSection={scrollToEnergyCompliance} />
              )}
              {R.isNil(checklist.selectedReport.zeroCarbon.proposedStep) && (
                <StepNotMetWarning i18nKey="zeroCarbonStepNotMet" scrollToSection={scrollToZeroCarbonCompliance} />
              )}
              <Alert
                status="info"
                rounded="lg"
                borderWidth={1}
                borderColor="semantic.info"
                bg="semantic.infoLight"
                gap={2}
                color="text.primary"
              >
                <LightningA color="var(--chakra-colors-semantic-info)" />
                {t(`${i18nPrefix}.notice`)}
              </Alert>
            </VStack>
            <FormProvider {...formMethods}>
              <form onSubmit={handleSubmit(onSubmit)} name="stepCodeChecklistForm">
                <Accordion allowMultiple defaultIndex={[0, 1, 2, 3, 4]} index={index} onChange={setIndex}>
                  <ProjectInfo checklist={checklist} />
                  <ComplianceSummary
                    checklist={checklist}
                    scrollToEnergyCompliance={scrollToEnergyCompliance}
                    scrollToZeroCarbonCompliance={scrollToZeroCarbonCompliance}
                  />
                  <CompletedBy checklist={checklist} />
                  <BuildingCharacteristicsSummary checklist={checklist} />
                  <EnergyPerformanceCompliance compliance={checklist.selectedReport.energy} />
                  <EnergyStepCodeCompliance ref={energyComplianceRef} compliance={checklist.selectedReport.energy} />
                  <ZeroCarbonStepCodeCompliance
                    ref={zeroCarbonComplianceRef}
                    compliance={checklist.selectedReport.zeroCarbon}
                  />
                </Accordion>
              </form>
            </FormProvider>
          </VStack>
        </Container>
      )}
    </Suspense>
  )
})
