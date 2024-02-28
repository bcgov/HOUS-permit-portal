import { StackDivider, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../models/step-code-checklist"
import { TextFormControl } from "../../../../../shared/form/input-form-control"
import { GridData } from "../../shared/compliance-grid/data"
import { RequirementsMetTag } from "../../shared/compliance-grid/requirements-met-tag"
import { GridRowHeader } from "../../shared/compliance-grid/row-header"
import { UnitsText } from "../../shared/compliance-grid/units-text"
import { translationPrefix } from "../translation-prefix"

interface IProps {
  checklist: IStepCodeChecklist
}

export const TotalGHG = function TotalGhg({ checklist }: IProps) {
  return (
    <>
      <GridRowHeader>{t(`${translationPrefix}.ghg.label`)}</GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.totalGhgRequirement || "-" }}
          hint={t(`${translationPrefix}.max`)}
          rightElement={
            <VStack spacing={0} divider={<StackDivider color="border.base" />}>
              <UnitsText>{t(`${translationPrefix}.ghg.units.numerator`)}</UnitsText>
              <UnitsText>{t(`${translationPrefix}.ghg.units.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.totalGhg || "-" }}
          rightElement={
            <VStack spacing={0} divider={<StackDivider color="border.base" />}>
              <UnitsText>{t(`${translationPrefix}.ghg.units.numerator`)}</UnitsText>
              <UnitsText>{t(`${translationPrefix}.ghg.units.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>
      <GridData>
        <RequirementsMetTag success={checklist.ghgPassed} />
      </GridData>
    </>
  )
}
