import { Box, Grid, HStack, Input, InputProps, Stack, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useCallback, useMemo } from "react"
import { useController, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IMpdelledEnergyOutputChecklistForm } from "."
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { formattedStringToNumber, numberToFormattedString } from "../../../../../../utils/utility-functions"
import { InfoTooltip } from "../../../../../shared/info-tooltip"
import { GridColumnHeader } from "../../../part-9/checklist/shared/grid/column-header"
import { GridData } from "../../../part-9/checklist/shared/grid/data"
import { GridRowHeader } from "../../../part-9/checklist/shared/grid/row-header"

const i18nPrefix = "stepCode.part3.modelledOutputs.annualEnergyWholeBuildingTable"

const sharedInputProps: Partial<InputProps> = {
  textAlign: "center",
}

const disabledInputProps: Partial<InputProps> = {
  isDisabled: true,
  ...sharedInputProps,
}

export const AnnualEnergyWholeBuildingGrid = observer(function AnnualEnergyWholeBuildingGrid() {
  const { t } = useTranslation()
  const { checklist } = usePart3StepCode()
  const totalOccupancyFloorArea = Number(checklist?.totalOccupancyFloorArea ?? 0)
  const {
    control,
    formState: { errors },
  } = useFormContext<IMpdelledEnergyOutputChecklistForm>()
  const thermalErrorMessage = errors.totalAnnualThermalEnergyDemand?.message as string | undefined
  const coolingErrorMessage = errors.totalAnnualCoolingEnergyDemand?.message as string | undefined

  const {
    field: { value: totalAnnualThermalEnergyDemand, onChange: onChangeTotalAnnualThermalEnergyDemand },
  } = useController({
    control,
    name: "totalAnnualThermalEnergyDemand",
    rules: {
      required:
        totalOccupancyFloorArea > 0
          ? t("ui.isRequired", { field: t(`${i18nPrefix}.annualThermalEnergyDemand`) })
          : false,
    },
  })
  const {
    field: { value: totalAnnualCoolingEnergyDemand, onChange: onChangeTotalAnnualCoolingEnergyDemand },
  } = useController({
    control,
    name: "totalAnnualCoolingEnergyDemand",
    rules: {
      required:
        totalOccupancyFloorArea > 0
          ? t("ui.isRequired", { field: t(`${i18nPrefix}.annualCoolingEnergyDemand`) })
          : false,
    },
  })
  const formattedTotalAnnualThermalEnergyDemand = useMemo(() => {
    if (isNaN(totalAnnualThermalEnergyDemand)) return ""
    return numberToFormattedString(totalAnnualThermalEnergyDemand)
  }, [totalAnnualThermalEnergyDemand])

  const formattedTotalAnnualCoolingEnergyDemand = useMemo(() => {
    if (isNaN(totalAnnualCoolingEnergyDemand)) return ""
    return numberToFormattedString(totalAnnualCoolingEnergyDemand)
  }, [totalAnnualCoolingEnergyDemand])
  const formattedThermalEnergyDemandPerSquareMeter = useMemo(() => {
    if (totalOccupancyFloorArea === 0 || isNaN(totalAnnualThermalEnergyDemand)) return ""

    return numberToFormattedString(totalAnnualThermalEnergyDemand / totalOccupancyFloorArea)
  }, [totalAnnualThermalEnergyDemand, totalOccupancyFloorArea])

  const formattedCoolingEnergyDemandPerSquareMeter = useMemo(() => {
    if (totalOccupancyFloorArea === 0 || isNaN(totalAnnualCoolingEnergyDemand)) return ""

    return numberToFormattedString(totalAnnualCoolingEnergyDemand / totalOccupancyFloorArea)
  }, [totalAnnualCoolingEnergyDemand, totalOccupancyFloorArea])

  const handleChangeTotalAnnualThermalEnergyDemand = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChangeTotalAnnualThermalEnergyDemand(formattedStringToNumber(e.target.value))
    },
    [onChangeTotalAnnualThermalEnergyDemand]
  )

  const handleChangeTotalAnnualCoolingEnergyDemand = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChangeTotalAnnualCoolingEnergyDemand(formattedStringToNumber(e.target.value))
    },
    [onChangeTotalAnnualCoolingEnergyDemand]
  )

  const editableInputProps = useMemo(() => {
    return totalOccupancyFloorArea > 0 ? sharedInputProps : disabledInputProps
  }, [totalOccupancyFloorArea])

  return (
    <Grid
      w="full"
      templateColumns="1fr repeat(2, minmax(auto, 147px))"
      borderWidth={1}
      borderTopWidth={0}
      borderX={0}
      borderColor="borders.light"
    >
      <GridColumnHeader colSpan={3}>{t(`${i18nPrefix}.tableHeader`)}</GridColumnHeader>
      {/* Thermal energy demand row */}
      <GridRowHeader>
        <HStack>
          <Text>{t(`${i18nPrefix}.annualThermalEnergyDemand`)}</Text>
          <Box>
            <InfoTooltip
              whiteSpace={"pre-line"}
              ariaLabel={t("stepCode.part3.modelledOutputs.useInfoIconLabel")}
              label={
                t("stepCode.part3.modelledOutputs.infoDescriptions.wholeBuildingAnnualThermalEnergyDemand") as string
              }
            />
          </Box>
        </HStack>
      </GridRowHeader>
      <GridData>
        <Stack direction="column" spacing={1} align="center">
          <Input
            value={formattedTotalAnnualThermalEnergyDemand}
            onChange={handleChangeTotalAnnualThermalEnergyDemand}
            {...editableInputProps}
          />
          {thermalErrorMessage && (
            <Text color="semantic.error" fontSize="sm">
              {thermalErrorMessage}
            </Text>
          )}
        </Stack>
      </GridData>
      <GridData borderRightWidth={1}>
        <Input value={formattedThermalEnergyDemandPerSquareMeter} isReadOnly {...disabledInputProps} />
      </GridData>
      {/* Cooling energy demand row */}
      <GridRowHeader>
        <HStack>
          <Text>{t(`${i18nPrefix}.annualCoolingEnergyDemand`)}</Text>
          <Box>
            <InfoTooltip
              whiteSpace={"pre-line"}
              ariaLabel={t("stepCode.part3.modelledOutputs.useInfoIconLabel")}
              label={
                t("stepCode.part3.modelledOutputs.infoDescriptions.wholeBuildingAnnualCoolingEnergyDemand") as string
              }
            />
          </Box>
        </HStack>
      </GridRowHeader>
      <GridData>
        <Stack direction="column" spacing={1} align="center">
          <Input
            value={formattedTotalAnnualCoolingEnergyDemand}
            onChange={handleChangeTotalAnnualCoolingEnergyDemand}
            {...editableInputProps}
          />
          {coolingErrorMessage && (
            <Text color="semantic.error" fontSize="sm">
              {coolingErrorMessage}
            </Text>
          )}
        </Stack>
      </GridData>
      <GridData borderRightWidth={1}>
        <Input value={formattedCoolingEnergyDemandPerSquareMeter} isReadOnly {...disabledInputProps} />
      </GridData>
    </Grid>
  )
})
