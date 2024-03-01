import { VStack } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { ChecklistSection } from "../shared/checklist-section"
import { DynamicCharacteristicsGrid } from "./dynamic-characteristics-grid"
import { StaticCharacteristicsGrid } from "./static-characteristics-grid"
import { translationPrefix } from "./translation-prefix"

export const BuildingCharacteristicsSummary = function BuildingCharacteristicsSummary({ checklist }) {
  return (
    <ChecklistSection heading={t(`${translationPrefix}.heading`)}>
      <VStack spacing={6}>
        <StaticCharacteristicsGrid />
        <DynamicCharacteristicsGrid checklist={checklist} />
      </VStack>
    </ChecklistSection>
  )
}
