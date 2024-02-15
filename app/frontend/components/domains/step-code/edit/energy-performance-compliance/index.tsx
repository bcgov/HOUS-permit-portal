import { Checkbox, HStack, Text } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useFormContext } from "react-hook-form"
import { IStepCodeChecklist } from "../../../../../models/step-code-checklist"
import { TextFormControl } from "../../../../shared/form/input-form-control"
import { ChecklistSection } from "../shared/checklist-section"
import { AirtightnessSelect } from "./airtightness-select"
import { EPCTestingTargetTypeSelect } from "./epc-testing-target-type-select"
import { translationPrefix } from "./translation-prefix"

interface IProps {
  checklist: IStepCodeChecklist
}

export const EnergyPerformanceCompliance = observer(function EnergyPerformanceCompliance({ checklist }: IProps) {
  const { control } = useFormContext()

  return (
    <ChecklistSection heading={t(`${translationPrefix}.heading`)}>
      <Text fontWeight="bold">{t(`${translationPrefix}.proposedHouseEnergyConsumption`)}</Text>
      <TextFormControl label={t(`${translationPrefix}.hvac`)} fieldName={"hvacConsumption"} />
      <TextFormControl label={t(`${translationPrefix}.dwhHeating`)} fieldName={"dhwHeatingConsumption"} />
      <Text fontWeight="bold">{t(`${translationPrefix}.referenceHouseRatedEnergyTarget`)}</Text>
      <TextFormControl label={t(`${translationPrefix}.hvac`)} fieldName={"refHvacConsumption"} />
      <TextFormControl label={t(`${translationPrefix}.dwhHeating`)} fieldName={"refDhwHeatingConsumption"} />
      <HStack>
        <Text>{t(`${translationPrefix}.calculationAirtightness`)}</Text>
        <Controller
          control={control}
          name="epcCalculationAirtightness"
          render={({ field: { onChange, value, ref } }) => <AirtightnessSelect onChange={onChange} value={value} />}
        />
      </HStack>
      <HStack>
        <Text>{t(`${translationPrefix}.calculationTestingTarget`)}</Text>
        {/* TODO: should this reflect selected testing target type? E.g. ACH, NLA, OR NLR?? */}
        <Text>{checklist.ach}</Text>
        <Controller
          control={control}
          name="epcCalculationTestingTargetType"
          render={({ field: { onChange, value } }) => <EPCTestingTargetTypeSelect onChange={onChange} value={value} />}
        />
      </HStack>
      <Controller
        name="epcCalculationCompliance"
        control={control}
        render={({ field: { onChange, value } }) => (
          <Checkbox isChecked={!!value} onChange={onChange}>
            {t(`${translationPrefix}.compliance`)}
          </Checkbox>
        )}
      />
    </ChecklistSection>
  )
})
