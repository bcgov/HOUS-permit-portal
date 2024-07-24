import { StackDivider, VStack } from "@chakra-ui/react"
import { Percent } from "@phosphor-icons/react"
import { t } from "i18next"
import React from "react"
import { IStepCodeEnergyComplianceReport } from "../../../../../../models/step-code-energy-compliance-report"
import { TextFormControl } from "../../../../../shared/form/input-form-control"
import { GridData } from "../../shared/grid/data"
import { RequirementsMetTag } from "../../shared/grid/requirements-met-tag"
import { GridRowHeader } from "../../shared/grid/row-header"
import { UnitsText } from "../../shared/grid/units-text"
import { i18nPrefix } from "../i18n-prefix"

interface IProps {
  compliance: IStepCodeEnergyComplianceReport
}

export const TEDI = function TEDI({ compliance }: IProps) {
  return (
    <>
      <GridRowHeader>{t(`${i18nPrefix}.tedi`)}</GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: compliance.tediRequirement || "-" }}
          hint={t(`${i18nPrefix}.max`)}
          rightElement={
            <VStack spacing={0} divider={<StackDivider color="border.base" />}>
              <UnitsText>{t(`${i18nPrefix}.tediUnits.numerator`)}</UnitsText>
              <UnitsText>{t(`${i18nPrefix}.tediUnits.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: compliance.tedi || "-" }}
          rightElement={
            <VStack spacing={0} divider={<StackDivider color="border.base" />}>
              <UnitsText>{t(`${i18nPrefix}.tediUnits.numerator`)}</UnitsText>
              <UnitsText>{t(`${i18nPrefix}.tediUnits.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>
      <GridData rowSpan={2} alignItems="center" justifyContent="center">
        <RequirementsMetTag success={compliance.tediPassed} />
      </GridData>
      <GridRowHeader>{t(`${i18nPrefix}.hlr`)}</GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: compliance.tediHlrPercentRequired || "-" }}
          hint={t(`${i18nPrefix}.min`)}
          rightElement={<Percent />}
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: compliance.tediHlrPercent || "-" }}
          rightElement={<Percent />}
        />
      </GridData>
    </>
  )
}
