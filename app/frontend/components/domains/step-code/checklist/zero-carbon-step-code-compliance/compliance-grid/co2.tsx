import { StackDivider, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../models/step-code-checklist"
import { TextFormControl } from "../../../../../shared/form/input-form-control"
import { GridColumnHeader } from "../../shared/compliance-grid/column-header"
import { GridData } from "../../shared/compliance-grid/data"
import { RequirementsMetTag } from "../../shared/compliance-grid/requirements-met-tag"
import { GridRowHeader } from "../../shared/compliance-grid/row-header"
import { UnitsText } from "../../shared/compliance-grid/units-text"
import { translationPrefix } from "../translation-prefix"

interface IProps {
  checklist: IStepCodeChecklist
}

export const CO2 = function CO2({ checklist }: IProps) {
  return (
    <>
      <GridColumnHeader colSpan={4}>{t(`${translationPrefix}.co2.title`)}</GridColumnHeader>

      <GridRowHeader>{t(`${translationPrefix}.co2.perFloorArea.label`)}</GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.co2Requirement || "-" }}
          hint={t(`${translationPrefix}.max`)}
          rightElement={
            <VStack spacing={0} divider={<StackDivider color="border.base" />}>
              <UnitsText>{t(`${translationPrefix}.co2.perFloorArea.units.numerator`)}</UnitsText>
              <UnitsText>{t(`${translationPrefix}.co2.perFloorArea.units.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.co2 || "-" }}
          rightElement={
            <VStack spacing={0} divider={<StackDivider color="border.base" />}>
              <UnitsText>{t(`${translationPrefix}.co2.perFloorArea.units.numerator`)}</UnitsText>
              <UnitsText>{t(`${translationPrefix}.co2.perFloorArea.units.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>
      <GridData rowSpan={2}>
        <RequirementsMetTag success={checklist.co2Passed} />
      </GridData>

      <GridRowHeader>{t(`${translationPrefix}.co2.max.label`)}</GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.co2MaxRequirement || "-" }}
          hint={t(`${translationPrefix}.max`)}
          rightElement={<UnitsText>{t(`${translationPrefix}.co2.max.units`)}</UnitsText>}
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.totalGhg || "-" }}
          rightElement={<UnitsText>{t(`${translationPrefix}.co2.max.units`)}</UnitsText>}
        />
      </GridData>
    </>
  )
}
