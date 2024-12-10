import { Button, Grid, GridProps, Input, Text } from "@chakra-ui/react"
import { Plus } from "@phosphor-icons/react"
import { computed } from "mobx"
import { isEmpty } from "ramda"
import React, { useCallback, useMemo } from "react"
import { FieldArrayWithId, useController, useFieldArray, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IMpdelledEnergyOutputChecklistForm } from "."
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { EFuelType } from "../../../../../../types/enums"
import { IFuelType } from "../../../../../../types/types"
import FuelTypeSelect from "../../../../../shared/select/selectors/fuel-type-select"
import { GridColumnHeader } from "../../../part-9/checklist/shared/grid/column-header"
import { GridData } from "../../../part-9/checklist/shared/grid/data"
import { GridRowHeader } from "../../../part-9/checklist/shared/grid/row-header"

interface IProps extends Partial<GridProps> {}

const i18nPrefix = "stepCode.part3.modelledOutputs.energyOutputsTable"

/**
 * Grid component for displaying modelled energy outputs and emissions calculations
 */
export const ModelledEnergyOutputsGrid = ({ ...rest }: IProps) => {
  const { t } = useTranslation()
  const { stepCode } = usePart3StepCode()
  const availableFuelTypes = useMemo(
    () => computed(() => stepCode?.checklist?.fuelTypes || []),
    [stepCode?.checklist?.fuelTypes]
  ).get()

  const { control, watch } = useFormContext<IMpdelledEnergyOutputChecklistForm>()
  const { fields } = useFieldArray({
    control: control,
    name: "modelledEnergyOutputsAttributes",
  })
  const watchedModelledEnergyOutputs = watch("modelledEnergyOutputsAttributes")
  const stringifiedWatchedModelledEnergyOutputs = JSON.stringify(watchedModelledEnergyOutputs)
  const fuelTypeIdsToFuelType = useMemo(
    () => stepCode?.checklist?.fuelTypeIdsToFuelType ?? {},
    [stepCode?.checklist?.fuelTypeIdsToFuelType]
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
    const total = watchedModelledEnergyOutputs.reduce((acc, curr) => acc + curr.annualEnergy, 0)

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
      templateColumns={`repeat(5, minmax(147px, auto))`}
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

      {/* Totals Row */}
      <GridRowHeader colSpan={1} fontWeight="bold" fontSize="sm">
        {t(`${i18nPrefix}.totalAnnualEnergy`)}
      </GridRowHeader>
      <GridData colSpan={2}>
        <Text textAlign="right">{formattedTotalAnnualEnergy}</Text>
      </GridData>
      <GridRowHeader colSpan={1} fontWeight="bold" fontSize="sm">
        {t(`${i18nPrefix}.totalEmissions`)}
      </GridRowHeader>
      <GridData colSpan={1} borderRightWidth={1}>
        <Text textAlign="right">{formattedTotalEmissions}</Text>
      </GridData>
    </Grid>
  )

  function handleAddUseType() {
    console.log("add use type")
  }
}

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
  const { control, watch } = useFormContext<IMpdelledEnergyOutputChecklistForm>()
  const {
    field: { value: fuelTypeId, onChange: onChangeFuelTypeId },
  } = useController({
    control,
    name: `modelledEnergyOutputsAttributes.${index}.fuelTypeId`,
  })
  const fuelTypeOptions = useMemo(() => {
    return availableFuelTypes.map((fuelType) => {
      const baseFuelTypeLabel = t(`${i18nPrefix}.fuelTypes.${fuelType.key as EFuelType}`)

      return {
        label: fuelType.key === "other" ? `${baseFuelTypeLabel} - ${fuelType.key}` : baseFuelTypeLabel,
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
  const selectedFuelType = useMemo(() => getFuelTypeById(fuelTypeId), [fuelTypeId, getFuelTypeById])

  const formattedAnnualEnergy = useMemo(() => {
    return typeof annualEnergy === "number" ? annualEnergy.toLocaleString("en-CA", { maximumFractionDigits: 3 }) : ""
  }, [annualEnergy])

  const handleChangeAnnualEnergy = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/,/g, "")
      const value = isEmpty(rawValue) ? 0 : Number(rawValue)

      onChangeAnnualEnergy(typeof value === "number" && !isNaN(value) ? value : 0)
    },
    [onChangeAnnualEnergy]
  )

  const handleChangeFuelType = useCallback(
    (fuelType: IFuelType | null) => {
      onChangeFuelTypeId(fuelType?.id)
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

  return (
    <React.Fragment>
      <GridData px={3} justifyContent={"center"}>
        <Text>{t(`${i18nPrefix}.useTypes.${field.useType}`)}</Text>
      </GridData>
      <GridData>
        <Input value={formattedAnnualEnergy} onChange={handleChangeAnnualEnergy} textAlign="right" min={0} />
      </GridData>
      <GridData>
        <FuelTypeSelect options={fuelTypeOptions} onChange={handleChangeFuelType} value={selectedFuelType} />
      </GridData>
      <GridData>
        <Input
          value={emissionFactor?.toLocaleString("en-CA", { maximumFractionDigits: 3 }) ?? ""}
          isReadOnly
          isDisabled
        />
      </GridData>
      <GridData borderRightWidth={1}>
        <Input value={calculatedEmissionsText ?? ""} isReadOnly isDisabled />
      </GridData>
    </React.Fragment>
  )
}
