import { StackDivider, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../models/step-code-checklist"
import { TextFormControl } from "../../../../../shared/form/input-form-control"
import { GridColumnHeader } from "../../shared/grid/column-header"
import { GridData } from "../../shared/grid/data"
import { RequirementsMetTag } from "../../shared/grid/requirements-met-tag"
import { GridRowHeader } from "../../shared/grid/row-header"
import { UnitsText } from "../../shared/grid/units-text"
import { i18nPrefix } from "../i18n-prefix"

interface IProps {
  checklist: IStepCodeChecklist
}

export const CO2 = function CO2({ checklist }: IProps) {
  return (
    <>
      <GridColumnHeader colSpan={4}>{t(`${i18nPrefix}.co2.title`)}</GridColumnHeader>

      <GridRowHeader>{t(`${i18nPrefix}.co2.perFloorArea.label`)}</GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.co2Requirement || "-" }}
          hint={t(`${i18nPrefix}.max`)}
          rightElement={
            <VStack spacing={0} divider={<StackDivider color="border.base" />}>
              <UnitsText>{t(`${i18nPrefix}.co2.perFloorArea.units.numerator`)}</UnitsText>
              <UnitsText>{t(`${i18nPrefix}.co2.perFloorArea.units.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.co2 || "-" }}
          rightElement={
            <VStack spacing={0} divider={<StackDivider color="border.base" />}>
              <UnitsText>{t(`${i18nPrefix}.co2.perFloorArea.units.numerator`)}</UnitsText>
              <UnitsText>{t(`${i18nPrefix}.co2.perFloorArea.units.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>
      <GridData rowSpan={2} alignItems="center" justifyContent="center">
        <RequirementsMetTag success={checklist.co2Passed} />
      </GridData>

      <GridRowHeader>{t(`${i18nPrefix}.co2.max.label`)}</GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.co2MaxRequirement || "-" }}
          hint={t(`${i18nPrefix}.max`)}
          rightElement={<UnitsText>{t(`${i18nPrefix}.co2.max.units`)}</UnitsText>}
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.totalGhg || "-" }}
          rightElement={<UnitsText>{t(`${i18nPrefix}.co2.max.units`)}</UnitsText>}
        />
      </GridData>
    </>
  )
}
