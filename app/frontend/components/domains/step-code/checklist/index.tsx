import { Center, Container, Heading, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { Suspense, useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../../setup/root"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
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
  const { handleSubmit, formState, reset } = formMethods
  const { isValid, isSubmitting } = formState

  const onSubmit = async (values) => {
    const result = await stepCode.updateStepCodeChecklist(checklist.id, values)
    if (result) navigate(-1)
  }

  const translationPrefix = "stepCodeChecklist.edit"
  const navHeight = document.getElementById("mainNav").offsetHeight

  return (
    <Suspense
      fallback={
        <Center p={50}>
          <SharedSpinner />
        </Center>
      }
    >
      {checklist?.isLoaded && (
        <Container my={10} maxW="3xl">
          <Heading mb={8}>{checklist.name}</Heading>
          <FormProvider {...formMethods}>
            <form onSubmit={handleSubmit(onSubmit)} name="stepCodeChecklistForm">
              <VStack spacing={4} pb={12}>
                <ProjectInfo checklist={checklist} />
                <ComplianceSummary checklist={checklist} />
                <CompletedBy />
                {/* TODO: Building Characteristics Summary */}
                <EnergyPerformanceCompliance checklist={checklist} />
                <EnergyStepCodeCompliance checklist={checklist} />
                <ZeroCarbonStepCodeCompliance checklist={checklist} />
              </VStack>
            </form>
          </FormProvider>
        </Container>
      )}
    </Suspense>
  )
})
