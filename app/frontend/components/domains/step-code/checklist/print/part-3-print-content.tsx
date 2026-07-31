import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPart3StepCode } from "../../../../../models/part-3-step-code"
import { IPart3StepCodeChecklist } from "../../../../../models/part-3-step-code-checklist"
import { BaselineOccupancies } from "../../part-3/form-section/baseline-occupancies"
import { BaselineDetails } from "../../part-3/form-section/baseline-occupancies/baseline-details"
import { BaselinePerformance } from "../../part-3/form-section/baseline-performance"
import { Contact } from "../../part-3/form-section/contact"
import { DistrictEnergy } from "../../part-3/form-section/district-energy"
import { DocumentReferences } from "../../part-3/form-section/document-references"
import { FuelTypes } from "../../part-3/form-section/fuel-types"
import { AdditionalFuelTypes } from "../../part-3/form-section/fuel-types/additional-fuel-types"
import { HVAC } from "../../part-3/form-section/hvac"
import { LocationDetails } from "../../part-3/form-section/location-details"
import { ModelledOutputs } from "../../part-3/form-section/modelled-outputs"
import { OverheatingRequirements } from "../../part-3/form-section/overheating-requirements"
import { PerformanceCharacteristics } from "../../part-3/form-section/performance-characteristics"
import { RenewableEnergy } from "../../part-3/form-section/renewable-energy"
import { Report } from "../../part-3/form-section/report"
import { RequirementsSummary } from "../../part-3/form-section/requirements-summary"
import { ResidentialAdjustments } from "../../part-3/form-section/residential-adjustments"
import { StartPage } from "../../part-3/form-section/start-page"
import { StepCodeOccupancies } from "../../part-3/form-section/step-code-occupancies"
import { StepCodeOccupanciesPerformanceRequirements } from "../../part-3/form-section/step-code-occupancies/performance-requirements"
import { StepCodeSummary } from "../../part-3/form-section/step-code-summary"
import { navLinks } from "../../part-3/sidebar/nav-sections"

// TODO(PM): Confirm stakeholders accept a full Part 3 form printout vs the old
// thin summary PDF (cover + project info + performance + mixed-use only).

const SECTION_COMPONENTS: Record<string, React.ComponentType> = {
  start: StartPage,
  "location-details": LocationDetails,
  "baseline-occupancies": BaselineOccupancies,
  "baseline-details": BaselineDetails,
  "district-energy": DistrictEnergy,
  "fuel-types": FuelTypes,
  "additional-fuel-types": AdditionalFuelTypes,
  "baseline-performance": BaselinePerformance,
  "step-code-occupancies": StepCodeOccupancies,
  "step-code-performance-requirements": StepCodeOccupanciesPerformanceRequirements,
  "modelled-outputs": ModelledOutputs,
  "renewable-energy": RenewableEnergy,
  "overheating-requirements": OverheatingRequirements,
  "residential-adjustments": ResidentialAdjustments,
  "performance-characteristics": PerformanceCharacteristics,
  hvac: HVAC,
  "requirements-summary": RequirementsSummary,
  "document-references": DocumentReferences,
  contact: Contact,
  "step-code-summary": StepCodeSummary,
  report: Report,
}

function flattenLocations(links: typeof navLinks): { location: string; key: string }[] {
  return links.flatMap((link) => [
    { location: link.location, key: link.key },
    ...flattenLocations(link.subLinks as typeof navLinks),
  ])
}

interface IProps {
  stepCode: IPart3StepCode
  checklist: IPart3StepCodeChecklist
}

export const Part3PrintContent = observer(function Part3PrintContent({ stepCode, checklist }: IProps) {
  const { t } = useTranslation()
  const sections = flattenLocations(navLinks).filter(
    ({ key, location }) => checklist.isRelevant(key as any) !== false && SECTION_COMPONENTS[location]
  )

  return (
    <Container maxW="960px" px={4} py={6}>
      <VStack align="stretch" spacing={2} mb={8}>
        <Heading as="h1" fontSize="2xl">
          {t("stepCode.part3.title")}
        </Heading>
        <Text fontSize="sm" color="text.secondary">
          {[stepCode.fullAddress, stepCode.jurisdictionName, stepCode.referenceNumber].filter(Boolean).join(" · ")}
        </Text>
        <Text fontSize="xs" color="text.secondary" fontStyle="italic">
          {/* Visible reminder until PM confirms full-form vs summary print */}
          Full checklist print (pending PM confirmation vs previous summary PDF)
        </Text>
      </VStack>
      <VStack align="stretch" spacing={10} pointerEvents="none">
        {sections.map(({ location }) => {
          const Section = SECTION_COMPONENTS[location]
          return (
            <Box
              key={location}
              className="step-code-print-section"
              borderBottomWidth={1}
              borderColor="border.light"
              pb={8}
            >
              <Section />
            </Box>
          )
        })}
      </VStack>
    </Container>
  )
})
