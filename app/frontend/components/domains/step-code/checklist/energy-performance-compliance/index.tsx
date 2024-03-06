import { Checkbox, Divider, FormControl, FormLabel, HStack, Text } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
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
  const { control, watch } = useFormContext()
  const watchProposedConsumptionFields = watch(["hvacConsumption", "dhwHeatingConsumption"])
  const watchReferenceConsumptionFields = watch(["refHvacConsumption", "refDhwHeatingConsumption"])

  return (
    <ChecklistSection heading={t(`${translationPrefix}.heading`)}>
      <Text fontWeight="bold" fontSize="md">
        {t(`${translationPrefix}.proposedHouseEnergyConsumption`)}
      </Text>
      <HStack>
        <TextFormControl
          label={t(`${translationPrefix}.hvac`)}
          fieldName={"hvacConsumption"}
          hint={t(`${translationPrefix}.energyUnit`)}
        />
        <Text fontWeight="bold" fontSize="2xl">
          +
        </Text>
        <TextFormControl
          label={t(`${translationPrefix}.dwhHeating`)}
          fieldName={"dhwHeatingConsumption"}
          hint={t(`${translationPrefix}.energyUnit`)}
        />
        <Text fontWeight="bold" fontSize="2xl">
          =
        </Text>
        <TextFormControl
          label={t(`${translationPrefix}.sum`)}
          inputProps={{
            isDisabled: true,
            value: R.sum(R.map((v) => parseInt(v || "0"), watchProposedConsumptionFields)),
          }}
          hint={t(`${translationPrefix}.energyUnit`)}
        />
      </HStack>
      <Divider />
      <Text fontWeight="bold" fontSize="md">
        {t(`${translationPrefix}.referenceHouseRatedEnergyTarget`)}
      </Text>
      <HStack>
        <TextFormControl
          label={t(`${translationPrefix}.hvac`)}
          fieldName={"refHvacConsumption"}
          hint={t(`${translationPrefix}.energyUnit`)}
        />
        <Text fontWeight="bold" fontSize="2xl">
          +
        </Text>
        <TextFormControl
          label={t(`${translationPrefix}.dwhHeating`)}
          fieldName={"refDhwHeatingConsumption"}
          hint={t(`${translationPrefix}.energyUnit`)}
        />
        <Text fontWeight="bold" fontSize="2xl">
          =
        </Text>
        <TextFormControl
          label={t(`${translationPrefix}.sum`)}
          inputProps={{
            isDisabled: true,
            value: R.sum(R.map((v) => parseInt(v || "0"), watchReferenceConsumptionFields)),
          }}
          hint={t(`${translationPrefix}.energyUnit`)}
        />
      </HStack>
      <Divider />
      <FormControl>
        <FormLabel>{t(`${translationPrefix}.calculationAirtightness`)}</FormLabel>
        <Controller
          control={control}
          name="epcCalculationAirtightness"
          render={({ field: { onChange, value, ref } }) => <AirtightnessSelect onChange={onChange} value={value} />}
        />
      </FormControl>
      <HStack align="end">
        <TextFormControl
          label={t(`${translationPrefix}.calculationTestingTarget`)}
          inputProps={{ isDisabled: true, value: checklist.ach }}
        />
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
