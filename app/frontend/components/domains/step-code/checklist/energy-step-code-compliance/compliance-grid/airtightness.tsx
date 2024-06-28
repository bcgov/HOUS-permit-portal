import { Text, VStack } from "@chakra-ui/react"
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

export const Airtightness = function Airtightness({ compliance }: IProps) {
  return (
    <>
      <GridRowHeader>
        <Text as="span">{t(`${i18nPrefix}.ach`)}</Text>
      </GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: compliance.achRequirement || "-" }}
          hint={t(`${i18nPrefix}.max`)}
          rightElement={
            <VStack spacing={0}>
              <UnitsText>{t(`${i18nPrefix}.achUnits.numerator`)}</UnitsText>
              <UnitsText>{t(`${i18nPrefix}.achUnits.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: compliance.ach || "-" }}
          rightElement={
            <VStack spacing={0}>
              <UnitsText>{t(`${i18nPrefix}.achUnits.numerator`)}</UnitsText>
              <UnitsText>{t(`${i18nPrefix}.achUnits.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>
      <GridData rowSpan={3} alignItems="center" justifyContent="center">
        <RequirementsMetTag success={compliance.airtightnessPassed} />
      </GridData>

      <GridRowHeader>{t(`${i18nPrefix}.nla`)}</GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: compliance.nlaRequirement || "-" }}
          hint={t(`${i18nPrefix}.max`)}
          rightElement={
            <VStack spacing={0}>
              <UnitsText>{t(`${i18nPrefix}.nlaUnits.numerator`)}</UnitsText>
              <UnitsText>{t(`${i18nPrefix}.nlaUnits.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: compliance.nla || "-" }}
          rightElement={
            <VStack spacing={0}>
              <UnitsText>{t(`${i18nPrefix}.nlaUnits.numerator`)}</UnitsText>
              <UnitsText>{t(`${i18nPrefix}.nlaUnits.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>

      <GridRowHeader>{t(`${i18nPrefix}.nlr`)}</GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: compliance.nlrRequirement || "-" }}
          hint={t(`${i18nPrefix}.max`)}
          rightElement={<UnitsText>{t(`${i18nPrefix}.nlrUnits`)}</UnitsText>}
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: compliance.nlr || "-" }}
          rightElement={<UnitsText>{t(`${i18nPrefix}.nlrUnits`)}</UnitsText>}
        />
      </GridData>
    </>
  )
}
