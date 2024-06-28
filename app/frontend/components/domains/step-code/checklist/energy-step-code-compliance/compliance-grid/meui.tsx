import { StackDivider, Text, VStack } from "@chakra-ui/react"
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

export const MEUI = function MEUI({ compliance }: IProps) {
  return (
    <>
      <GridRowHeader>
        <Text as="span">{t(`${i18nPrefix}.meui`)}</Text>
      </GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: compliance.meuiRequirement || "-" }}
          hint={t(`${i18nPrefix}.max`)}
          rightElement={
            <VStack spacing={0} divider={<StackDivider color="border.base" />}>
              <UnitsText>{t(`${i18nPrefix}.meuiUnits.numerator`)}</UnitsText>
              <UnitsText>{t(`${i18nPrefix}.meuiUnits.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: compliance.meui || "-" }}
          rightElement={
            <VStack spacing={0} divider={<StackDivider color="border.base" />}>
              <UnitsText>{t(`${i18nPrefix}.meuiUnits.numerator`)}</UnitsText>
              <UnitsText>{t(`${i18nPrefix}.meuiUnits.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>
      <GridData rowSpan={2} alignItems="center" justifyContent="center">
        <RequirementsMetTag success={compliance.meuiPassed} />
      </GridData>

      <GridRowHeader>{t(`${i18nPrefix}.meuiImprovement`)}</GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{
            isDisabled: true,
            textAlign: "center",
            value: compliance.meuiPercentImprovementRequirement || "-",
          }}
          hint={t(`${i18nPrefix}.min`)}
          rightElement={<Percent />}
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: compliance.meuiPercentImprovement || "-" }}
          rightElement={<Percent />}
        />
      </GridData>
    </>
  )
}
