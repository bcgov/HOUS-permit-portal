import { Text, VStack } from "@chakra-ui/react"
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

export const Airtightness = function Airtightness({ checklist }: IProps) {
  return (
    <>
      <GridRowHeader>
        <Text as="span">{t(`${i18nPrefix}.ach`)}</Text>
      </GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.achRequirement || "-" }}
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
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.ach || "-" }}
          rightElement={
            <VStack spacing={0}>
              <UnitsText>{t(`${i18nPrefix}.achUnits.numerator`)}</UnitsText>
              <UnitsText>{t(`${i18nPrefix}.achUnits.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>
      <GridData rowSpan={3} alignItems="center" justifyContent="center">
        <RequirementsMetTag success={checklist.airtightnessPassed} />
      </GridData>

      <GridRowHeader>{t(`${i18nPrefix}.nla`)}</GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.nlaRequirement || "-" }}
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
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.nla || "-" }}
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
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.nlrRequirement || "-" }}
          hint={t(`${i18nPrefix}.max`)}
          rightElement={<UnitsText>{t(`${i18nPrefix}.nlrUnits`)}</UnitsText>}
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.nlr || "-" }}
          rightElement={<UnitsText>{t(`${i18nPrefix}.nlrUnits`)}</UnitsText>}
        />
      </GridData>
    </>
  )
}
