import { StackDivider, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../models/step-code-checklist"
import { TextFormControl } from "../../../../../shared/form/input-form-control"
import { GridData } from "../../shared/grid/data"
import { RequirementsMetTag } from "../../shared/grid/requirements-met-tag"
import { GridRowHeader } from "../../shared/grid/row-header"
import { UnitsText } from "../../shared/grid/units-text"
import { i18nPrefix } from "../i18n-prefix"

interface IProps {
  checklist: IStepCodeChecklist
}

export const TotalGHG = function TotalGhg({ checklist }: IProps) {
  return (
    <>
      <GridRowHeader>{t(`${i18nPrefix}.ghg.label`)}</GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.totalGhgRequirement || "-" }}
          hint={t(`${i18nPrefix}.max`)}
          rightElement={
            <VStack spacing={0} divider={<StackDivider color="border.base" />}>
              <UnitsText>{t(`${i18nPrefix}.ghg.units.numerator`)}</UnitsText>
              <UnitsText>{t(`${i18nPrefix}.ghg.units.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.totalGhg || "-" }}
          rightElement={
            <VStack spacing={0} divider={<StackDivider color="border.base" />}>
              <UnitsText>{t(`${i18nPrefix}.ghg.units.numerator`)}</UnitsText>
              <UnitsText>{t(`${i18nPrefix}.ghg.units.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>
      <GridData alignItems="center" justifyContent="center">
        <RequirementsMetTag success={checklist.ghgPassed} />
      </GridData>
    </>
  )
}
