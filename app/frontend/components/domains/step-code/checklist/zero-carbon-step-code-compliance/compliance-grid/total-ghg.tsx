import { StackDivider, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { IStepCodeZeroCarbonComplianceReport } from "../../../../../../models/step-code-zero-carbon-compliance-report"
import { TextFormControl } from "../../../../../shared/form/input-form-control"
import { GridData } from "../../shared/grid/data"
import { RequirementsMetTag } from "../../shared/grid/requirements-met-tag"
import { GridRowHeader } from "../../shared/grid/row-header"
import { UnitsText } from "../../shared/grid/units-text"
import { i18nPrefix } from "../i18n-prefix"

interface IProps {
  compliance: IStepCodeZeroCarbonComplianceReport
}

export const TotalGHG = function TotalGhg({ compliance }: IProps) {
  return (
    <>
      <GridRowHeader>{t(`${i18nPrefix}.ghg.label`)}</GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: compliance.totalGhgRequirement || "-" }}
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
          inputProps={{ isDisabled: true, textAlign: "center", value: compliance.totalGhg || "-" }}
          rightElement={
            <VStack spacing={0} divider={<StackDivider color="border.base" />}>
              <UnitsText>{t(`${i18nPrefix}.ghg.units.numerator`)}</UnitsText>
              <UnitsText>{t(`${i18nPrefix}.ghg.units.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>
      <GridData alignItems="center" justifyContent="center">
        <RequirementsMetTag success={compliance.ghgPassed} />
      </GridData>
    </>
  )
}
