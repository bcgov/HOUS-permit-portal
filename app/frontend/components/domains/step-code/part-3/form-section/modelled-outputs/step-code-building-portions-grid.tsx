import { Box, Grid, HStack, Input, InputProps, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useCallback, useMemo } from "react"
import { useController, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IMpdelledEnergyOutputChecklistForm } from "."
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { formattedStringToNumber, numberToFormattedString } from "../../../../../../utils/utility-functions"
import { InfoTooltip } from "../../../../../shared/info-tooltip"
import { GridColumnHeader } from "../../../step-generic/shared/grid/column-header"
import { GridData } from "../../../step-generic/shared/grid/data"
import { GridRowHeader } from "../../../step-generic/shared/grid/row-header"

const sharedInputProps: Partial<InputProps> = {
  textAlign: "center",
}

const disabledInputProps: Partial<InputProps> = {
  ...sharedInputProps,
  isDisabled: true,
}

export const StepCodeBuildingPortionsGrid = observer(function StepCodeBuildingPortionGrid() {
  const { t } = useTranslation()
  const i18nPrefix = "stepCode.part3.modelledOutputs.stepCodeBuildingPortionsTable"
  const { checklist } = usePart3StepCode()
  const totalStepCodeOccupancyFloorArea = Number(checklist?.totalStepCodeOccupancyFloorArea ?? "0")
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

  const formattedStepCodeAnnualThermalEnergyDemandPerSquareMeter = useMemo(() => {
    if (totalStepCodeOccupancyFloorArea === 0) return ""

    return numberToFormattedString(stepCodeAnnualThermalEnergyDemand / totalStepCodeOccupancyFloorArea)
  }, [stepCodeAnnualThermalEnergyDemand, totalStepCodeOccupancyFloorArea])

  const editableInputProps = useMemo(() => {
    return totalStepCodeOccupancyFloorArea > 0 ? sharedInputProps : disabledInputProps
  }, [totalStepCodeOccupancyFloorArea])

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
      <GridRowHeader>
        <HStack>
          <Text>{t(`${i18nPrefix}.annualThermalEnergyDemand`)}</Text>
          <Box>
            <InfoTooltip
              whiteSpace={"pre-line"}
              ariaLabel={t("stepCode.part3.modelledOutputs.useInfoIconLabel")}
              label={t("stepCode.part3.modelledOutputs.infoDescriptions.stepCodeAnnualThermalEnergyDemand") as string}
            />
          </Box>
        </HStack>
      </GridRowHeader>
      <GridData borderRightWidth={1}>
        <Input
          value={formattedStepCodeAnnualThermalEnergyDemand}
          onChange={handleChangeStepCodeAnnualThermalEnergyDemand}
          {...editableInputProps}
        />
      </GridData>

      {/* kWh/m2 */}
      <GridRowHeader>{t(`${i18nPrefix}.kwhM2`)}</GridRowHeader>
      <GridData borderRightWidth={1}>
        <Input value={formattedStepCodeAnnualThermalEnergyDemandPerSquareMeter} isReadOnly {...disabledInputProps} />
      </GridData>
    </Grid>
  )
})
