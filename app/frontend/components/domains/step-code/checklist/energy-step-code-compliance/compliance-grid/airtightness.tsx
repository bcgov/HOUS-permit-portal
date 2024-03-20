import { Text, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../models/step-code-checklist"
import { TextFormControl } from "../../../../../shared/form/input-form-control"
import { GridData } from "../../shared/grid/data"
import { RequirementsMetTag } from "../../shared/grid/requirements-met-tag"
import { GridRowHeader } from "../../shared/grid/row-header"
import { UnitsText } from "../../shared/grid/units-text"
import { translationPrefix } from "../translation-prefix"

interface IProps {
  checklist: IStepCodeChecklist
}

export const Airtightness = function Airtightness({ checklist }: IProps) {
  return (
    <>
      <GridRowHeader>
        <Text as="span">{t(`${translationPrefix}.ach`)}</Text>
      </GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.achRequirement || "-" }}
          hint={t(`${translationPrefix}.max`)}
          rightElement={
            <VStack spacing={0}>
              <UnitsText>{t(`${translationPrefix}.achUnits.numerator`)}</UnitsText>
              <UnitsText>{t(`${translationPrefix}.achUnits.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.ach || "-" }}
          rightElement={
            <VStack spacing={0}>
              <UnitsText>{t(`${translationPrefix}.achUnits.numerator`)}</UnitsText>
              <UnitsText>{t(`${translationPrefix}.achUnits.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>
      <GridData rowSpan={3}>
        <RequirementsMetTag success={checklist.airtightnessPassed} />
      </GridData>

      <GridRowHeader>{t(`${translationPrefix}.nla`)}</GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.nlaRequirement || "-" }}
          hint={t(`${translationPrefix}.max`)}
          rightElement={
            <VStack spacing={0}>
              <UnitsText>{t(`${translationPrefix}.nlaUnits.numerator`)}</UnitsText>
              <UnitsText>{t(`${translationPrefix}.nlaUnits.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.nla || "-" }}
          rightElement={
            <VStack spacing={0}>
              <UnitsText>{t(`${translationPrefix}.nlaUnits.numerator`)}</UnitsText>
              <UnitsText>{t(`${translationPrefix}.nlaUnits.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>

      <GridRowHeader>{t(`${translationPrefix}.nlr`)}</GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.nlrRequirement || "-" }}
          hint={t(`${translationPrefix}.max`)}
          rightElement={<UnitsText>{t(`${translationPrefix}.nlrUnits`)}</UnitsText>}
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.nlr || "-" }}
          rightElement={<UnitsText>{t(`${translationPrefix}.nlrUnits`)}</UnitsText>}
        />
      </GridData>
    </>
  )
}
