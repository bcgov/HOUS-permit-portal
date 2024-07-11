import { Checkbox, Divider, FormControl, FormLabel, HStack, Text } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { Controller, useFormContext } from "react-hook-form"
import { IStepCodeEnergyComplianceReport } from "../../../../../models/step-code-energy-compliance-report"
import { TextFormControl } from "../../../../shared/form/input-form-control"
import { ChecklistSection } from "../shared/checklist-section"
import { AirtightnessSelect } from "./airtightness-select"
import { EPCTestingTargetTypeSelect } from "./epc-testing-target-type-select"
import { i18nPrefix } from "./i18n-prefix"

interface IProps {
  compliance: IStepCodeEnergyComplianceReport
}

export const EnergyPerformanceCompliance = observer(function EnergyPerformanceCompliance({ compliance }: IProps) {
  const { control, watch } = useFormContext()
  const watchProposedConsumptionFields = watch(["hvacConsumption", "dhwHeatingConsumption"])
  const watchReferenceConsumptionFields = watch(["refHvacConsumption", "refDhwHeatingConsumption"])

  return (
    <ChecklistSection heading={t(`${i18nPrefix}.heading`)}>
      <Text fontWeight="bold" fontSize="md">
        {t(`${i18nPrefix}.proposedHouseEnergyConsumption`)}
      </Text>
      <HStack>
        <TextFormControl
          label={t(`${i18nPrefix}.hvac`)}
          fieldName={"hvacConsumption"}
          hint={t(`${i18nPrefix}.energyUnit`)}
        />
        <Text fontWeight="bold" fontSize="2xl">
          +
        </Text>
        <TextFormControl
          label={t(`${i18nPrefix}.dwhHeating`)}
          fieldName={"dhwHeatingConsumption"}
          hint={t(`${i18nPrefix}.energyUnit`)}
        />
        <Text fontWeight="bold" fontSize="2xl">
          =
        </Text>
        <TextFormControl
          label={t(`${i18nPrefix}.sum`)}
          inputProps={{
            isDisabled: true,
            value: R.sum(R.map((v) => parseInt(v || "0"), watchProposedConsumptionFields)),
          }}
          hint={t(`${i18nPrefix}.energyUnit`)}
        />
      </HStack>
      <Divider />
      <Text fontWeight="bold" fontSize="md">
        {t(`${i18nPrefix}.referenceHouseRatedEnergyTarget`)}
      </Text>
      <HStack>
        <TextFormControl
          label={t(`${i18nPrefix}.hvac`)}
          fieldName={"refHvacConsumption"}
          hint={t(`${i18nPrefix}.energyUnit`)}
        />
        <Text fontWeight="bold" fontSize="2xl">
          +
        </Text>
        <TextFormControl
          label={t(`${i18nPrefix}.dwhHeating`)}
          fieldName={"refDhwHeatingConsumption"}
          hint={t(`${i18nPrefix}.energyUnit`)}
        />
        <Text fontWeight="bold" fontSize="2xl">
          =
        </Text>
        <TextFormControl
          label={t(`${i18nPrefix}.sum`)}
          inputProps={{
            isDisabled: true,
            value: R.sum(R.map((v) => parseInt(v || "0"), watchReferenceConsumptionFields)),
          }}
          hint={t(`${i18nPrefix}.energyUnit`)}
        />
      </HStack>
      <Divider />
      <FormControl>
        <FormLabel>{t(`${i18nPrefix}.calculationAirtightness`)}</FormLabel>
        <Controller
          control={control}
          name="epcCalculationAirtightness"
          render={({ field: { onChange, value, ref } }) => <AirtightnessSelect onChange={onChange} value={value} />}
        />
      </FormControl>
      <HStack align="end">
        <TextFormControl
          label={t(`${i18nPrefix}.calculationTestingTarget`)}
          inputProps={{ isDisabled: true, value: compliance.ach }}
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
            {t(`${i18nPrefix}.compliance`)}
          </Checkbox>
        )}
      />
    </ChecklistSection>
  )
})
