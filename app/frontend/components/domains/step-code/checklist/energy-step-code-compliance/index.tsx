import { HStack, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { forwardRef } from "react"
import { IStepCodeEnergyComplianceReport } from "../../../../../models/step-code-energy-compliance-report"
import { TextFormControl } from "../../../../shared/form/input-form-control"
import { ChecklistSection } from "../shared/checklist-section"
import { EnergyComplianceGrid } from "./compliance-grid"
import { i18nPrefix } from "./i18n-prefix"
import { OtherData } from "./other-data"

interface IProps {
  compliance: IStepCodeEnergyComplianceReport
}

export const EnergyStepCodeCompliance = observer(
  forwardRef<HTMLDivElement, IProps>(function EnergyStepCodeCompliance({ compliance }, ref) {
    return (
      <ChecklistSection ref={ref} heading={t(`${i18nPrefix}.heading`)} isAutoFilled>
        <HStack>
          <VStack>
            <TextFormControl
              label={t(`${i18nPrefix}.proposedConsumption`)}
              inputProps={{ isDisabled: true, value: compliance.energyTarget || "-" }}
              hint={t(`${i18nPrefix}.consumptionUnit`)}
            />
          </VStack>
          <VStack>
            <TextFormControl
              label={t(`${i18nPrefix}.refConsumption`)}
              inputProps={{ isDisabled: true, value: compliance.refEnergyTarget || "-" }}
              hint={t(`${i18nPrefix}.consumptionUnit`)}
            />
          </VStack>
        </HStack>

        <VStack spacing={6} align="start">
          <EnergyComplianceGrid compliance={compliance} />
          <OtherData compliance={compliance} />
        </VStack>
      </ChecklistSection>
    )
  })
)
