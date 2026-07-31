import { Accordion, Box, Container, Heading, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useRef } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IPart9StepCodeChecklist } from "../../../../../models/part-9-step-code-checklist"
import { BuildingCharacteristicsSummary } from "../../part-9/checklist/building-characteristics-summary"
import { CompletedBy } from "../../part-9/checklist/completed-by"
import { ComplianceSummary } from "../../part-9/checklist/compliance-summary"
import { EnergyPerformanceCompliance } from "../../part-9/checklist/energy-performance-compliance"
import { EnergyStepCodeCompliance } from "../../part-9/checklist/energy-step-code-compliance"
import { ProjectInfo } from "../../part-9/checklist/project-info"
import { ZeroCarbonStepCodeCompliance } from "../../part-9/checklist/zero-carbon-step-code-compliance"

interface IProps {
  checklist: IPart9StepCodeChecklist
}

const ALL_SECTIONS = [0, 1, 2, 3, 4, 5, 6]

export const Part9PrintContent = observer(function Part9PrintContent({ checklist }: IProps) {
  const { t } = useTranslation()
  const formMethods = useForm({ mode: "onChange", defaultValues: checklist.defaultFormValues })
  const { reset } = formMethods
  const energyComplianceRef = useRef<HTMLDivElement>(null)
  const zeroCarbonComplianceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (checklist.isLoaded) {
      reset(checklist.defaultFormValues)
    }
  }, [checklist.id, checklist.isLoaded, reset])

  return (
    <Container maxW="780px" px={4} py={6}>
      <VStack align="stretch" spacing={4} mb={6}>
        <Heading as="h1" fontSize="2xl">
          {t("stepCodeChecklist.edit.heading")}
        </Heading>
        <Text fontSize="sm" color="text.secondary">
          {[checklist.fullAddress, checklist.jurisdictionName, checklist.referenceNumber].filter(Boolean).join(" · ")}
        </Text>
      </VStack>
      <Box pointerEvents="none">
        <FormProvider {...formMethods}>
          <Accordion allowMultiple index={ALL_SECTIONS} onChange={() => undefined}>
            <ProjectInfo checklist={checklist} />
            <ComplianceSummary
              checklist={checklist}
              scrollToEnergyCompliance={() => undefined}
              scrollToZeroCarbonCompliance={() => undefined}
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
        </FormProvider>
      </Box>
    </Container>
  )
})
