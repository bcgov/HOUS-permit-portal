import { Button, Grid, GridProps, Input, Text } from "@chakra-ui/react"
import { Plus } from "@phosphor-icons/react"
import { computed } from "mobx"
import React, { useCallback, useMemo } from "react"
import { FieldArrayWithId, useController, useFieldArray, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IMpdelledEnergyOutputChecklistForm } from "."
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { EFuelType } from "../../../../../../types/enums"
import { IFuelType } from "../../../../../../types/types"
import { NumberFormControl } from "../../../../../shared/form/input-form-control"
import FuelTypeSelect from "../../../../../shared/select/selectors/fuel-type-select"
import { GridColumnHeader } from "../../../part-9/checklist/shared/grid/column-header"
import { GridData } from "../../../part-9/checklist/shared/grid/data"

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

  const { control } = useFormContext<IMpdelledEnergyOutputChecklistForm>()
  const { fields, append, remove } = useFieldArray({
    control: control,
    name: "modelledEnergyOutputsAttributes",
  })

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
        />
      ))}

      {/* Add Row Button */}
      <GridData colSpan={5} borderRightWidth={1}>
        <Button leftIcon={<Plus />} variant="link" size="sm" fontSize={"sm"} onClick={handleAddUseType} isDisabled>
          {t(`${i18nPrefix}.addUseType`)}
        </Button>
      </GridData>

      {/* Totals Row */}
      {/* <GridRowHeader colSpan={2} fontWeight="bold">
        {t(`${i18nPrefix}.totalAnnualEnergy`)}
      </GridRowHeader>
      <GridData>
        <Text textAlign="right" fontWeight="bold">
          {totalAnnualEnergy.toLocaleString()}
        </Text>
      </GridData>
      <GridData colSpan={2} borderRightWidth={1}>
        <Text textAlign="right" fontWeight="bold">
          {totalEmissions.toLocaleString()}
        </Text>
      </GridData> */}
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
}

/**
 * Component for rendering a single row in the modelled energy outputs grid
 */
const ModelledEnergyOutputRow = ({ index, field, availableFuelTypes }: IModelledEnergyOutputRowProps) => {
  const { t } = useTranslation()
  const { control, watch } = useFormContext<IMpdelledEnergyOutputChecklistForm>()
  const {
    field: { value: fuelTypeId, onChange: onChangeFuelTypeId },
  } = useController({
    control,
    name: `modelledEnergyOutputsAttributes.${index}.fuelTypeId`,
  })
  const fuelTypeOptions = useMemo(
    () =>
      availableFuelTypes.map((fuelType) => {
        const baseFuelTypeLabel = t(`${i18nPrefix}.fuelTypes.${fuelType.key as EFuelType}`)

        return {
          label: fuelType.key === "other" ? `${baseFuelTypeLabel} - ${fuelType.key}` : baseFuelTypeLabel,
          value: fuelType,
        }
      }),
    [availableFuelTypes, t]
  )

  const watchedAnnualEnergy = watch(`modelledEnergyOutputsAttributes.${index}.annualEnergy`)

  const selectedFuelType = useMemo(() => {
    return availableFuelTypes.find((fuelType) => fuelType.id === fuelTypeId)
  }, [availableFuelTypes, fuelTypeId])

  const handleChangeFuelType = useCallback(
    (fuelType: IFuelType | null) => {
      onChangeFuelTypeId(fuelType?.id)
    },
    [onChangeFuelTypeId]
  )

  const emissionFactor = useMemo(() => {
    return typeof selectedFuelType?.emissionsFactor === "string" ? Number(selectedFuelType?.emissionsFactor) : null
  }, [selectedFuelType?.emissionsFactor])

  const calculatedEmissions = useMemo(() => {
    if (typeof emissionFactor !== "number") return null
    const calculated = Number(watchedAnnualEnergy) * Number(emissionFactor)
    const fixed = calculated.toFixed(3)
    return fixed.endsWith(".000") ? Math.round(calculated).toString() : fixed
  }, [emissionFactor, watchedAnnualEnergy])

  return (
    <React.Fragment>
      <GridData px={3} justifyContent={"center"}>
        <Text>{t(`${i18nPrefix}.useTypes.${field.useType}`)}</Text>
      </GridData>
      <GridData>
        <NumberFormControl
          fieldName={`modelledEnergyOutputsAttributes.${index}.annualEnergy`}
          inputProps={{
            textAlign: "right",
            type: "number",
            min: 0,
          }}
        />
      </GridData>
      <GridData>
        <FuelTypeSelect options={fuelTypeOptions} onChange={handleChangeFuelType} value={selectedFuelType} />
      </GridData>
      <GridData>
        <Input value={emissionFactor} isReadOnly isDisabled />
      </GridData>
      <GridData borderRightWidth={1}>
        <Input value={calculatedEmissions} isReadOnly isDisabled />
      </GridData>
    </React.Fragment>
  )
}
