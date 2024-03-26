import { Accordion, Alert, Center, Container, Heading, VStack } from "@chakra-ui/react"
import { LightningA, WarningCircle } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { Suspense, useEffect } from "react"
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
import { ZeroCarbonStepCodeCompliance } from "./zero-carbon-step-code-compliance"

export const StepCodeChecklistForm = observer(function StepCodeChecklistForm() {
  const {
    stepCodeStore: { currentStepCode: stepCode },
  } = useMst()
  const checklist = stepCode.preConstructionChecklist
  const navigate = useNavigate()

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
    const result = await stepCode.updateStepCodeChecklist(checklist.id, values)
    if (result) navigate(-1)
  }

  const translationPrefix = "stepCodeChecklist.edit"

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
            <Heading fontSize="2xl" mb={0} color="text.primary">
              {t(`${translationPrefix}.heading`)}
            </Heading>
            <VStack spacing={2}>
              {R.isNil(checklist.proposedEnergyStep) && (
                <Alert
                  status="error"
                  rounded="lg"
                  borderWidth={1}
                  borderColor="semantic.error"
                  bg="semantic.errorLight"
                  gap={2}
                  color="text.primary"
                >
                  <WarningCircle color="var(--chakra-colors-semantic-error)" />
                  {t(`${translationPrefix}.energyStepNotMet`)}
                </Alert>
              )}
              {R.isNil(checklist.proposedZeroCarbonStep) && (
                <Alert
                  status="error"
                  rounded="lg"
                  borderWidth={1}
                  borderColor="semantic.error"
                  bg="semantic.errorLight"
                  gap={2}
                  color="text.primary"
                >
                  <WarningCircle color="var(--chakra-colors-semantic-error)" />
                  {t(`${translationPrefix}.zeroCarbonStepNotMet`)}
                </Alert>
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
                {t(`${translationPrefix}.notice`)}
              </Alert>
            </VStack>
            <FormProvider {...formMethods}>
              <form onSubmit={handleSubmit(onSubmit)} name="stepCodeChecklistForm">
                <Accordion allowMultiple defaultIndex={[0, 1, 2, 3, 4]}>
                  {/* <VStack spacing={4} pb={12}> */}
                  <ProjectInfo checklist={checklist} />
                  <ComplianceSummary checklist={checklist} />
                  <CompletedBy checklist={checklist} />
                  <BuildingCharacteristicsSummary checklist={checklist} />
                  <EnergyPerformanceCompliance checklist={checklist} />
                  <EnergyStepCodeCompliance checklist={checklist} />
                  <ZeroCarbonStepCodeCompliance checklist={checklist} />
                  {/* </VStack> */}
                </Accordion>
              </form>
            </FormProvider>
          </VStack>
        </Container>
      )}
    </Suspense>
  )
})
