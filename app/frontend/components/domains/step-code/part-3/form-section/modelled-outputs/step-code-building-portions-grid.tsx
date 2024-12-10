import { Grid, Input, InputProps } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useCallback, useMemo } from "react"
import { useController, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IMpdelledEnergyOutputChecklistForm } from "."
import { formattedStringToNumber, numberToFormattedString } from "../../../../../../utils/utility-functions"
import { GridColumnHeader } from "../../../part-9/checklist/shared/grid/column-header"
import { GridData } from "../../../part-9/checklist/shared/grid/data"
import { GridRowHeader } from "../../../part-9/checklist/shared/grid/row-header"

const sharedInputProps: Partial<InputProps> = {
  textAlign: "center",
}

export const StepCodeBuildingPortionsGrid = observer(function StepCodeBuildingPortionGrid() {
  const { t } = useTranslation()
  const i18nPrefix = "stepCode.part3.modelledOutputs.stepCodeBuildingPortionsTable"
  const { control } = useFormContext<IMpdelledEnergyOutputChecklistForm>()
  const {
    field: { value: stepCodeAnnualThermalEnergyDemand, onChange: onChangeStepCodeAnnualThermalEnergyDemand },
  } = useController({ control, name: "stepCodeAnnualThermalEnergyDemand" })

  const formattedStepCodeAnnualThermalEnergyDemand = useMemo(() => {
    return numberToFormattedString(stepCodeAnnualThermalEnergyDemand)
  }, [stepCodeAnnualThermalEnergyDemand])

  const handleChangeStepCodeAnnualThermalEnergyDemand = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChangeStepCodeAnnualThermalEnergyDemand(formattedStringToNumber(e.target.value))
    },
    [onChangeStepCodeAnnualThermalEnergyDemand]
  )

  return (
    <Grid
      w="full"
      templateColumns="auto minmax(auto, 332px)"
      borderWidth={1}
      borderTopWidth={0}
      borderX={0}
      borderColor="borders.light"
    >
      <GridColumnHeader colSpan={2}>{t(`${i18nPrefix}.tableHeader`)}</GridColumnHeader>

      {/* Annual thermal energy demand row   */}
      <GridRowHeader>{t(`${i18nPrefix}.annualThermalEnergyDemand`)}</GridRowHeader>
      <GridData borderRightWidth={1}>
        <Input
          value={formattedStepCodeAnnualThermalEnergyDemand}
          onChange={handleChangeStepCodeAnnualThermalEnergyDemand}
          {...sharedInputProps}
        />
      </GridData>

      {/* kWh/m2 */}
      <GridRowHeader>{t(`${i18nPrefix}.kwhM2`)}</GridRowHeader>
      <GridData borderRightWidth={1}>
        <Input {...sharedInputProps} isDisabled isReadOnly />
      </GridData>
    </Grid>
  )
})
