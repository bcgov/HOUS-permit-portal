import { Textarea } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { useFormContext } from "react-hook-form"
import { IStepCodeChecklist } from "../../../../../../models/step-code-checklist"
import { TextFormControl } from "../../../../../shared/form/input-form-control"
import { GridColumnHeader } from "../../shared/grid/column-header"
import { GridData } from "../../shared/grid/data"
import { i18nPrefix } from "../i18n-prefix"

interface IProps {
  checklist: IStepCodeChecklist
}

export const Airtightness = function BuildingCharacteristicsSummaryAirtightness({ checklist }: IProps) {
  const { register } = useFormContext()
  const fieldNamePrefix = "buildingCharacteristicsSummaryAttributes.airtightness"
  return (
    <>
      <GridColumnHeader colSpan={3} borderRightWidth={1}>
        {t(`${i18nPrefix}.airtightness`)}
      </GridColumnHeader>

      <GridData rowSpan={3} gap={1} alignItems="start" pos="relative">
        <Textarea h="full" {...register(`${fieldNamePrefix}.details`)} />
      </GridData>
      <GridData>
        <TextFormControl inputProps={{ value: t(`${i18nPrefix}.ach`), isDisabled: true }} />
      </GridData>
      <GridData borderRightWidth={1}>
        <TextFormControl inputProps={{ value: checklist.ach, isDisabled: true }} />
      </GridData>
      <GridData borderTopWidth={0}>
        <TextFormControl inputProps={{ value: t(`${i18nPrefix}.nla`), isDisabled: true }} />
      </GridData>
      <GridData borderTopWidth={0} borderRightWidth={1}>
        <TextFormControl inputProps={{ value: checklist.nla, isDisabled: true }} />
      </GridData>
      <GridData borderTopWidth={0}>
        <TextFormControl inputProps={{ value: t(`${i18nPrefix}.nlr`), isDisabled: true }} />
      </GridData>
      <GridData borderTopWidth={0} borderRightWidth={1}>
        <TextFormControl inputProps={{ value: checklist.nlr, isDisabled: true }} />
      </GridData>
    </>
  )
}
