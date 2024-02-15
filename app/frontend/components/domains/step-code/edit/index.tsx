import { Button, Center, Container, Heading, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { Suspense, useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useNavigate, useParams } from "react-router-dom"
import { useMst } from "../../../../setup/root"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { CompletedBy } from "./completed-by"
import { ComplianceSummary } from "./compliance-summary"
import { EnergyPerformanceCompliance } from "./energy-performance-compliance"
import { EnergyStepCodeCompliance } from "./energy-step-code-compliance"
import { ProjectInfo } from "./project-info"
import { ZeroCarbonStepCodeCompliance } from "./zero-carbon-step-code-compliance"

export const EditStepCodeChecklistForm = observer(function EditStepCodeChecklistForm() {
  const {
    stepCodeStore: { isLoaded, fetchStepCodes, getStepCode },
  } = useMst()
  const { stepCodeId, stepCodeChecklistId } = useParams()
  const stepCode = isLoaded && getStepCode(stepCodeId)
  const checklist = stepCode?.getChecklist(stepCodeChecklistId)
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => await fetchStepCodes()
    !isLoaded && fetch()
  }, [isLoaded])

  useEffect(() => {
    const fetch = async () => await checklist.load()
    isLoaded && checklist && !checklist.isLoaded && fetch()
  }, [isLoaded])

  useEffect(() => {
    checklist?.isLoaded && reset(checklist.defaultFormValues)
  }, [checklist?.isLoaded])

  const formMethods = useForm({ mode: "onChange" })
  const { handleSubmit, formState, reset } = formMethods
  const { isValid, isSubmitting } = formState

  const onSubmit = async (values) => {
    const result = await stepCode.updateStepCodeChecklist(stepCodeChecklistId, values)
    if (result) navigate(`/step-codes`)
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
      {isLoaded && checklist?.isLoaded && (
        <Container my={10} maxW="3xl">
          <Heading mb={8}>{checklist.name}</Heading>
          <FormProvider {...formMethods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack spacing={4}>
                <ProjectInfo checklist={checklist} />
                <ComplianceSummary checklist={checklist} />
                <CompletedBy />
                {/* TODO: Building Characteristics Summary */}
                <EnergyPerformanceCompliance checklist={checklist} />
                <EnergyStepCodeCompliance checklist={checklist} />
                <ZeroCarbonStepCodeCompliance checklist={checklist} />
                <Button
                  variant="primary"
                  w="full"
                  type="submit"
                  isDisabled={!isValid || isSubmitting}
                  isLoading={isSubmitting}
                >
                  {t(`${translationPrefix}.update`)}
                </Button>
              </VStack>
            </form>
          </FormProvider>
        </Container>
      )}
    </Suspense>
  )
})
