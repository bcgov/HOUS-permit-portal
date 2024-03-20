import { HStack, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { IStepCodeChecklist } from "../../../../../models/step-code-checklist"
import { TextFormControl } from "../../../../shared/form/input-form-control"
import { ChecklistSection } from "../shared/checklist-section"
import { EnergyComplianceGrid } from "./compliance-grid"
import { OtherData } from "./other-data"

interface IProps {
  checklist: IStepCodeChecklist
}

export const EnergyStepCodeCompliance = observer(function EnergyStepCodeCompliance({ checklist }: IProps) {
  const translationPrefix = "stepCodeChecklist.edit.energyStepCodeCompliance"

  return (
    <ChecklistSection heading={t(`${translationPrefix}.heading`)} isAutoFilled>
      <HStack>
        <VStack>
          <TextFormControl
            label={t(`${translationPrefix}.proposedConsumption`)}
            inputProps={{ isDisabled: true, value: checklist.energyTarget || "-" }}
            hint={t(`${translationPrefix}.consumptionUnit`)}
          />
        </VStack>
        <VStack>
          <TextFormControl
            label={t(`${translationPrefix}.refConsumption`)}
            inputProps={{ isDisabled: true, value: checklist.refEnergyTarget || "-" }}
            hint={t(`${translationPrefix}.consumptionUnit`)}
          />
        </VStack>
      </HStack>

      <VStack spacing={6} align="start">
        <EnergyComplianceGrid checklist={checklist} />
        <OtherData checklist={checklist} />
      </VStack>
    </ChecklistSection>
  )
})
