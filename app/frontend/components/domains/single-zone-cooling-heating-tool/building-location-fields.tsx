import { Grid, GridProps } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { TextFormControl } from "../../shared/form/input-form-control"

export interface BuildingLocationFieldsProps {
  // Base key for form paths, e.g. "buildingLocation"
  namePrefix?: string
  // i18n prefix for labels, e.g. "singleZoneCoolingHeatingTool.coverSheet.buildingLocation"
  i18nPrefix: string
  // Optional grid overrides (columns, gap, etc.)
  gridProps?: Partial<GridProps>
}

export const BuildingLocationFields: React.FC<BuildingLocationFieldsProps> = ({
  namePrefix = "buildingLocation",
  i18nPrefix,
  gridProps,
}) => {
  const { t } = useTranslation()

  const field = (key: string) => `${namePrefix}.${key}`
  const label = (key: string) => t(`${i18nPrefix}.${key}`)

  return (
    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} {...gridProps}>
      <TextFormControl fieldName={field("model")} required label={label("model")} />
      <TextFormControl fieldName={field("site")} required label={label("site")} />
      <TextFormControl fieldName={field("lot")} required label={label("lot")} />
      <TextFormControl fieldName={field("address")} required label={label("address")} />
      <TextFormControl fieldName={field("city")} required label={label("city")} />
      <TextFormControl fieldName={field("province")} required label={label("province")} />
      <TextFormControl fieldName={field("postalCode")} required label={label("postalCode")} />
    </Grid>
  )
}
