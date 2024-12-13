import { Box, Button, Flex, Grid, GridProps, IconButton, Input, InputProps, Stack, Text } from "@chakra-ui/react"
import { Plus, X } from "@phosphor-icons/react"
import { computed } from "mobx"
import { observer } from "mobx-react-lite"
import { path } from "ramda"
import React, { useCallback, useEffect, useMemo } from "react"
import { FieldArrayWithId, useController, useFieldArray, useFormContext } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { IMpdelledEnergyOutputChecklistForm } from "."
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { EEnergyOutputUseType, EFuelType } from "../../../../../../types/enums"
import { IFuelType } from "../../../../../../types/types"
import { formattedStringToNumber, numberToFormattedString } from "../../../../../../utils/utility-functions"
import { TextFormControl } from "../../../../../shared/form/input-form-control"
import { InfoTooltip } from "../../../../../shared/info-tooltip"
import FuelTypeSelect from "../../../../../shared/select/selectors/fuel-type-select"
import { HStack } from "../../../part-9/checklist/pdf-content/shared/h-stack"
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
  py: 6,
}

/**
 * Grid component for displaying modelled energy outputs and emissions calculations
 */
export const ModelledEnergyOutputsGrid = observer(({ ...rest }: IProps) => {
  const { t } = useTranslation()
  const { checklist } = usePart3StepCode()
  const availableFuelTypes = useMemo(() => computed(() => checklist?.fuelTypes || []), [checklist?.fuelTypes]).get()

  const { control, watch } = useFormContext<IMpdelledEnergyOutputChecklistForm>()
  const { fields, append, remove } = useFieldArray({
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
      <GridColumnHeader textAlign="left">{t(`${i18nPrefix}.column.use`)}</GridColumnHeader>
      <GridColumnHeader textAlign="left">{t(`${i18nPrefix}.column.annualEnergy`)}</GridColumnHeader>
      <GridColumnHeader textAlign="left">{t(`${i18nPrefix}.column.fuelType`)}</GridColumnHeader>
      <GridColumnHeader textAlign="left">{t(`${i18nPrefix}.column.emissionsFactor`)}</GridColumnHeader>
      <GridColumnHeader textAlign="left" borderRightWidth={1}>
        {t(`${i18nPrefix}.column.emissions`)}
      </GridColumnHeader>

      {/* Data Rows */}
      {fields.map((field, index) => (
        <ModelledEnergyOutputRow
          key={`${field.useType}-${field?.name ?? ""}`}
          index={index}
          field={field}
          availableFuelTypes={availableFuelTypes}
          getFuelTypeById={getFuelTypeById}
          removeRow={remove}
        />
      ))}

      {/* Add Row Button */}
      <GridData colSpan={5} borderRightWidth={1} pb={9}>
        <Button leftIcon={<Plus />} variant="link" size="sm" fontSize={"sm"} onClick={handleAddUseType}>
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
        <HStack>
          {t(`${i18nPrefix}.totalAnnualEnergy`)}
          <Box>
            <InfoTooltip
              whiteSpace={"pre-line"}
              ariaLabel={t("stepCode.part3.modelledOutputs.useInfoIconLabel")}
              label={t("stepCode.part3.modelledOutputs.infoDescriptions.totalAnnualEnergy") as string}
            />
          </Box>
        </HStack>
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
    append({
      useType: EEnergyOutputUseType.other,
      name: "",
      annualEnergy: 0,
      fuelTypeId: null,
    })
  }
})

interface IModelledEnergyOutputRowProps {
  index: number
  field: FieldArrayWithId<IMpdelledEnergyOutputChecklistForm, "modelledEnergyOutputsAttributes", "id">
  availableFuelTypes: IFuelType[]
  getFuelTypeById: (id: string) => IFuelType | undefined
  removeRow: (index: number) => void
}

/**
 * Component for rendering a single row in the modelled energy outputs grid
 */
const ModelledEnergyOutputRow = ({
  index,
  field,
  availableFuelTypes,
  getFuelTypeById,
  removeRow,
}: IModelledEnergyOutputRowProps) => {
  const { checklist } = usePart3StepCode()
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

  const isUseTypeOther = field.useType === EEnergyOutputUseType.other

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
      required: annualEnergy > 0 || isUseTypeOther ? t("ui.isRequired", { field: undefined }) : false,
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

  const handleRemoveUseType = useCallback(() => {
    if (isUseTypeOther) {
      removeRow(index)
      return
    }

    onChangeFuelTypeId(null)
  }, [removeRow, index, isUseTypeOther, onChangeFuelTypeId])

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

  const useTypeInfoTanslationKey = useMemo(() => {
    const typeToKey = {
      [EEnergyOutputUseType.heatingGeneral]: "stepCode.part3.modelledOutputs.infoDescriptions.generalHeating",
      [EEnergyOutputUseType.domesticHotWater]: "stepCode.part3.modelledOutputs.infoDescriptions.domesticHotWater",
    } as const

    return typeToKey[field.useType]
  }, [field.useType])

  return (
    <React.Fragment>
      <GridData {...sharedGridDataProps} pl={2}>
        <Flex>
          <IconButton
            mr={1}
            icon={<X />}
            variant="link"
            size="sm"
            color="semantic.error"
            aria-label={t("ui.remove")}
            visibility={fuelTypeId || isUseTypeOther ? "visible" : "hidden"}
            onClick={handleRemoveUseType}
          />
          <HStack>
            {isUseTypeOther ? (
              <TextFormControl flex={1} fieldName={`modelledEnergyOutputsAttributes.${index}.name`} required />
            ) : (
              <Text flex={1}>{t(`${i18nPrefix}.useTypes.${field.useType}`)}</Text>
            )}
            {useTypeInfoTanslationKey && (
              <Box>
                <InfoTooltip
                  whiteSpace={"pre-line"}
                  ariaLabel={t("stepCode.part3.modelledOutputs.useInfoIconLabel")}
                  iconSize={14}
                  label={t(useTypeInfoTanslationKey) as string}
                />
              </Box>
            )}
          </HStack>
        </Flex>
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
      <GridData {...sharedGridDataProps}>
        <Stack spacing={0.5} flexDirection={"column"}>
          <FuelTypeSelect
            options={checklist.fuelTypeSelectOptions}
            onChange={onChangeFuelTypeId}
            value={fuelTypeId}
            selectProps={{
              "aria-errormessage": fuelTypeErrorMessage,
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
                    borderWidth: fuelTypeErrorMessage ? "2px" : undefined,
                  },
                }),
              },
            }}
          />
          {fuelTypeErrorMessage && (
            <Text color="semantic.error" fontSize="sm">
              {fuelTypeErrorMessage}
            </Text>
          )}
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
