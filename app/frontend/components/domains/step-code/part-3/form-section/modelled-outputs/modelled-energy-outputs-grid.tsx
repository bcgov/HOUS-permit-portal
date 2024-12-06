import { Button, Grid, GridProps } from "@chakra-ui/react"
import { Plus } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { GridColumnHeader } from "../../../part-9/checklist/shared/grid/column-header"
import { GridData } from "../../../part-9/checklist/shared/grid/data"

interface IModelledOutput {
  use: string
  annualEnergy: number
  fuelType: string
  emissionsFactor: number
  emissions: number
}

interface IProps extends Partial<GridProps> {}
/**
 * Grid component for displaying modelled energy outputs and emissions calculations
 */
export const ModelledEnergyOutputsGrid = ({ ...rest }: IProps) => {
  const { t } = useTranslation()
  const i18nPrefix = "stepCode.part3.modelledOutputs.energyOutputsTable"

  return (
    <Grid
      w="full"
      templateColumns={`repeat(5, minmax(114px, auto))`}
      borderWidth={1}
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
      {/* {fields.map((field, index) => (
        <React.Fragment key={field.id}>
          <GridData>
            <TextFormControl
              fieldName={`modelledOutputs.${index}.use`}
              inputProps={{ placeholder: t(`${i18nPrefix}.usePlaceholder`) }}
            />
          </GridData>
          <GridData>
            <TextFormControl
              fieldName={`modelledOutputs.${index}.annualEnergy`}
              inputProps={{
                textAlign: "right",
                type: "number",
                min: 0,
              }}
            />
          </GridData>
          <GridData>
            <Select name={`modelledOutputs.${index}.fuelType`} defaultValue="electricity">
              <option value="electricity">{t(`${i18nPrefix}.fuelTypes.electricity`)}</option>
              <option value="naturalGas">{t(`${i18nPrefix}.fuelTypes.naturalGas`)}</option>
            </Select>
          </GridData>
          <GridData>
            <TextFormControl
              fieldName={`modelledOutputs.${index}.emissionsFactor`}
              inputProps={{
                textAlign: "right",
                isDisabled: true,
              }}
            />
          </GridData>
          <GridData borderRightWidth={1}>
            <TextFormControl
              fieldName={`modelledOutputs.${index}.emissions`}
              inputProps={{
                textAlign: "right",
                isDisabled: true,
              }}
            />
          </GridData>
        </React.Fragment>
      ))} */}

      {/* Add Row Button */}
      <GridData colSpan={5} borderRightWidth={1}>
        <Button leftIcon={<Plus />} variant="link" size="sm" fontSize={"sm"} onClick={handleAddUseType}>
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
