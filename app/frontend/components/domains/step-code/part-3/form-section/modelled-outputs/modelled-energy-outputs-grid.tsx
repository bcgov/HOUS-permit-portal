import { Box, Button, Grid, GridProps, Input, InputProps, Stack, Text, Tooltip } from "@chakra-ui/react"
import { Plus } from "@phosphor-icons/react"
import { Info } from "@phosphor-icons/react/dist/ssr"
import { computed } from "mobx"
import { observer } from "mobx-react-lite"
import { path } from "ramda"
import React, { useCallback, useEffect, useMemo } from "react"
import { FieldArrayWithId, useController, useFieldArray, useFormContext } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { IMpdelledEnergyOutputChecklistForm } from "."
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { EFuelType } from "../../../../../../types/enums"
import { IFuelType } from "../../../../../../types/types"
import { formattedStringToNumber, numberToFormattedString } from "../../../../../../utils/utility-functions"
import FuelTypeSelect from "../../../../../shared/select/selectors/fuel-type-select"
import { GridColumnHeader } from "../../../part-9/checklist/shared/grid/column-header"
import { GridData } from "../../../part-9/checklist/shared/grid/data"
import { GridRowHeader } from "../../../part-9/checklist/shared/grid/row-header"

interface IProps extends Partial<GridProps> {}

const i18nPrefix = "stepCode.part3.modelledOutputs.energyOutputsTable"
const sharedInputProps: Partial<InputProps> = {
  textAlign: "center",
  w: "114.5px",
}
const disabledInputProps: Partial<InputProps> = {
  isDisabled: true,
  isReadOnly: true,
  ...sharedInputProps,
}

const sharedGridDataProps = {
  justifyContent: "center",
  pt: 6,
}

/**
 * Grid component for displaying modelled energy outputs and emissions calculations
 */
export const ModelledEnergyOutputsGrid = observer(({ ...rest }: IProps) => {
  const { t } = useTranslation()
  const { checklist } = usePart3StepCode()
  const availableFuelTypes = useMemo(() => computed(() => checklist?.fuelTypes || []), [checklist?.fuelTypes]).get()

  const { control, watch } = useFormContext<IMpdelledEnergyOutputChecklistForm>()
  const { fields } = useFieldArray({
    control: control,
    name: "modelledEnergyOutputsAttributes",
  })
  const watchedModelledEnergyOutputs = watch("modelledEnergyOutputsAttributes")
  const stringifiedWatchedModelledEnergyOutputs = JSON.stringify(watchedModelledEnergyOutputs)
  const fuelTypeIdsToFuelType = useMemo(
    () => checklist?.fuelTypeIdsToFuelType ?? {},
    [checklist?.fuelTypeIdsToFuelType]
  )
  const fuelTypeIdsToAnnualEnergy = useMemo(() => {
    return watchedModelledEnergyOutputs.reduce<Record<string, number>>((acc, curr) => {
      if (!curr.fuelTypeId) return acc

      acc[curr.fuelTypeId] = (acc[curr.fuelTypeId] ?? 0) + Number(curr.annualEnergy)
      return acc
    }, {})
  }, [stringifiedWatchedModelledEnergyOutputs])
  const fuelTypeIdsToEmissions = useMemo(() => {
    return watchedModelledEnergyOutputs.reduce<Record<string, number>>((acc, curr) => {
      const fuelType = fuelTypeIdsToFuelType[curr.fuelTypeId]

      if (!fuelType) return acc

      const emissionFactor =
        typeof fuelType.emissionsFactor === "string" || typeof fuelType.emissionsFactor === "number"
          ? Number(fuelType.emissionsFactor)
          : null

      if (typeof emissionFactor !== "number") return acc

      const emissions = Number(curr.annualEnergy) * emissionFactor
      acc[fuelType.id] = (acc[fuelType.id] ?? 0) + emissions
      return acc
    }, {})
  }, [stringifiedWatchedModelledEnergyOutputs, fuelTypeIdsToFuelType])
  const formattedTotalAnnualEnergy = useMemo(() => {
    return watchedModelledEnergyOutputs
      .reduce((acc, curr) => acc + curr.annualEnergy, 0)
      .toLocaleString("en-CA", {
        maximumFractionDigits: 3,
      })
  }, [stringifiedWatchedModelledEnergyOutputs])
  const formattedTotalEmissions = useMemo(() => {
    return Object.values(fuelTypeIdsToEmissions)
      .reduce((acc, curr) => acc + curr, 0)
      .toLocaleString("en-CA", {
        maximumFractionDigits: 3,
      })
  }, [fuelTypeIdsToEmissions])

  const getFuelTypeById = useCallback(
    (id: string) => {
      return fuelTypeIdsToFuelType[id]
    },
    [fuelTypeIdsToFuelType]
  )

  return (
    <Grid
      w="full"
      templateColumns={`repeat(5, minmax(auto, 147px))`}
      borderWidth={1}
      borderTopWidth={0}
      borderX={0}
      borderColor="borders.light"
      {...rest}
    >
      {/* Header Row */}
      <GridColumnHeader>{t(`${i18nPrefix}.column.use`)}</GridColumnHeader>
      <GridColumnHeader>{t(`${i18nPrefix}.column.annualEnergy`)}</GridColumnHeader>
      <GridColumnHeader>{t(`${i18nPrefix}.column.fuelType`)}</GridColumnHeader>
      <GridColumnHeader>{t(`${i18nPrefix}.column.emissionsFactor`)}</GridColumnHeader>
      <GridColumnHeader borderRightWidth={1}>{t(`${i18nPrefix}.column.emissions`)}</GridColumnHeader>

      {/* Data Rows */}
      {fields.map((field, index) => (
        <ModelledEnergyOutputRow
          key={`${field.useType}-${field?.name ?? ""}`}
          index={index}
          field={field}
          availableFuelTypes={availableFuelTypes}
          getFuelTypeById={getFuelTypeById}
        />
      ))}

      {/* Add Row Button */}
      <GridData colSpan={5} borderRightWidth={1} pb={9}>
        <Button leftIcon={<Plus />} variant="link" size="sm" fontSize={"sm"} onClick={handleAddUseType} isDisabled>
          {t(`${i18nPrefix}.addUseType`)}
        </Button>
      </GridData>

      {/* Total by fuel type rows */}
      {Object.values(fuelTypeIdsToFuelType).map((fuelType) => {
        const fuelTypeLabel = t(`${i18nPrefix}.fuelTypes.${fuelType.key as EFuelType}`)
        const isOther = fuelType.key === "other"
        return (
          <React.Fragment key={fuelType.id}>
            <GridRowHeader colSpan={1} fontSize="md">
              <Trans
                i18nKey={isOther ? `${i18nPrefix}.totalByFuelTypeOther` : `${i18nPrefix}.totalByFuelType`}
                components={{ 1: <Text as="span" textTransform="lowercase" /> }}
                values={{
                  fuelType: isOther ? undefined : fuelTypeLabel,
                  fuelTypeDescription: isOther ? fuelType.description : undefined,
                }}
              />
            </GridRowHeader>
            <GridData colSpan={2}>
              <Input
                value={
                  fuelTypeIdsToAnnualEnergy[fuelType.id]?.toLocaleString?.("en-CA", { maximumFractionDigits: 3 }) ?? ""
                }
                {...disabledInputProps}
              />
            </GridData>
            <GridData colSpan={1}>
              <Input value={getFuelTypeById(fuelType.id)?.emissionsFactor ?? ""} {...disabledInputProps} />
            </GridData>
            <GridData colSpan={1} borderRightWidth={1}>
              <Input
                value={
                  fuelTypeIdsToEmissions[fuelType.id]?.toLocaleString?.("en-CA", { maximumFractionDigits: 3 }) ?? ""
                }
                {...disabledInputProps}
              />
            </GridData>
          </React.Fragment>
        )
      })}

      {/* Totals Row */}
      <GridRowHeader colSpan={1} fontWeight="bold" fontSize="sm">
        {t(`${i18nPrefix}.totalAnnualEnergy`)}
      </GridRowHeader>
      <GridData colSpan={2}>
        <Input value={formattedTotalAnnualEnergy} {...disabledInputProps} />
      </GridData>
      <GridRowHeader colSpan={1} fontWeight="bold" fontSize="sm">
        {t(`${i18nPrefix}.totalEmissions`)}
      </GridRowHeader>
      <GridData colSpan={1} borderRightWidth={1}>
        <Input value={formattedTotalEmissions} {...disabledInputProps} />
      </GridData>
    </Grid>
  )

  function handleAddUseType() {
    console.log("add use type")
  }
})

interface IModelledEnergyOutputRowProps {
  index: number
  field: FieldArrayWithId<IMpdelledEnergyOutputChecklistForm, "modelledEnergyOutputsAttributes", "id">
  availableFuelTypes: IFuelType[]
  getFuelTypeById: (id: string) => IFuelType | undefined
}

/**
 * Component for rendering a single row in the modelled energy outputs grid
 */
const ModelledEnergyOutputRow = ({
  index,
  field,
  availableFuelTypes,
  getFuelTypeById,
}: IModelledEnergyOutputRowProps) => {
  const { t } = useTranslation()
  const {
    control,
    formState: { errors },
  } = useFormContext<IMpdelledEnergyOutputChecklistForm>()

  const fuelTypeOptions = useMemo(() => {
    return availableFuelTypes.map((fuelType) => {
      const baseFuelTypeLabel = t(`${i18nPrefix}.fuelTypes.${fuelType.key as EFuelType}`)

      return {
        label: fuelType.key === "other" ? `${baseFuelTypeLabel} - ${fuelType.description}` : baseFuelTypeLabel,
        value: fuelType,
      }
    })
  }, [availableFuelTypes, t])

  const {
    field: { value: annualEnergy, onChange: onChangeAnnualEnergy },
  } = useController({
    control,
    name: `modelledEnergyOutputsAttributes.${index}.annualEnergy`,
  })

  const {
    field: { value: fuelTypeId, onChange: onChangeFuelTypeId },
  } = useController({
    control,
    name: `modelledEnergyOutputsAttributes.${index}.fuelTypeId`,
    rules: {
      required:
        annualEnergy > 0
          ? {
              value: true,
              message: t(`${i18nPrefix}.fuelTypeRequired`),
            }
          : false,
    },
  })
  const selectedFuelType = useMemo(() => getFuelTypeById(fuelTypeId) ?? null, [fuelTypeId, getFuelTypeById])

  const formattedAnnualEnergy = useMemo(() => {
    return numberToFormattedString(annualEnergy)
  }, [annualEnergy])

  const handleChangeAnnualEnergy = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChangeAnnualEnergy(formattedStringToNumber(e.target.value))
    },
    [onChangeAnnualEnergy]
  )

  const handleChangeFuelType = useCallback(
    (fuelType: IFuelType | null) => {
      onChangeFuelTypeId(fuelType?.id ?? null)
    },
    [onChangeFuelTypeId]
  )

  const emissionFactor = useMemo(() => {
    return typeof selectedFuelType?.emissionsFactor === "string" ||
      typeof selectedFuelType?.emissionsFactor === "number"
      ? Number(selectedFuelType?.emissionsFactor)
      : null
  }, [selectedFuelType?.emissionsFactor])

  const calculatedEmissionsText = useMemo(() => {
    if (typeof emissionFactor !== "number") return null
    const calculated = Number(annualEnergy) * Number(emissionFactor)
    const fixed = calculated.toLocaleString("en-CA", { maximumFractionDigits: 3 })
    return fixed
  }, [emissionFactor, annualEnergy])

  const fuelTypeErrorMessage = path(["modelledEnergyOutputsAttributes", index, "fuelTypeId", "message"], errors)

  useEffect(() => {
    if (!fuelTypeId) {
      onChangeAnnualEnergy(0)
    }
  }, [fuelTypeId])

  return (
    <React.Fragment>
      <GridData {...sharedGridDataProps}>
        <Text>{t(`${i18nPrefix}.useTypes.${field.useType}`)}</Text>
      </GridData>
      <GridData {...sharedGridDataProps}>
        <Input
          isDisabled={!fuelTypeId}
          value={formattedAnnualEnergy}
          onChange={handleChangeAnnualEnergy}
          min={0}
          {...sharedInputProps}
        />
      </GridData>
      <GridData {...sharedGridDataProps} pt={1}>
        <Stack spacing={0.5} flexDirection={"column"}>
          <Box alignSelf={"flex-end"}>
            <Tooltip
              label={fuelTypeId ? t(`${i18nPrefix}.fuelTypeClearHelpText`) : t(`${i18nPrefix}.fuelTypeRequired`)}
            >
              <Info size={16} />
            </Tooltip>
          </Box>
          <FuelTypeSelect
            options={fuelTypeOptions}
            onChange={handleChangeFuelType}
            value={selectedFuelType}
            selectProps={{
              "aria-errormessage": fuelTypeErrorMessage,
              isClearable: true,
              styles: {
                container: (base) => ({
                  ...base,
                  width: "100%",
                  boxShadow: "none",
                }),
                control: (base) => ({
                  ...base,
                  "&, &:hover, &:focus, &:active": {
                    boxShadow: fuelTypeErrorMessage ? "0 0 0 1px var(--chakra-colors-semantic-errorLight)" : undefined,
                    borderColor: fuelTypeErrorMessage ? "var(--chakra-colors-semantic-error)" : undefined,
                  },
                }),
              },
            }}
          />
        </Stack>
      </GridData>
      <GridData {...sharedGridDataProps}>
        <Input
          value={emissionFactor?.toLocaleString("en-CA", { maximumFractionDigits: 3 }) ?? ""}
          {...disabledInputProps}
        />
      </GridData>
      <GridData borderRightWidth={1} {...sharedGridDataProps}>
        <Input value={calculatedEmissionsText ?? ""} {...disabledInputProps} />
      </GridData>
    </React.Fragment>
  )
}
