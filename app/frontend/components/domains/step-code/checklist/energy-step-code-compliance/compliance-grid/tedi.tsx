import { StackDivider, VStack } from "@chakra-ui/react"
import { Percent } from "@phosphor-icons/react"
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

export const TEDI = function TEDI({ checklist }: IProps) {
  return (
    <>
      <GridRowHeader>{t(`${translationPrefix}.tedi`)}</GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.tediRequirement || "-" }}
          hint={t(`${translationPrefix}.max`)}
          rightElement={
            <VStack spacing={0} divider={<StackDivider color="border.base" />}>
              <UnitsText>{t(`${translationPrefix}.tediUnits.numerator`)}</UnitsText>
              <UnitsText>{t(`${translationPrefix}.tediUnits.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.tedi || "-" }}
          rightElement={
            <VStack spacing={0} divider={<StackDivider color="border.base" />}>
              <UnitsText>{t(`${translationPrefix}.tediUnits.numerator`)}</UnitsText>
              <UnitsText>{t(`${translationPrefix}.tediUnits.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>
      <GridData rowSpan={2}>
        <RequirementsMetTag success={checklist.tediPassed} />
      </GridData>
      <GridRowHeader>{t(`${translationPrefix}.hlr`)}</GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.tediHlrPercentRequired || "-" }}
          hint={t(`${translationPrefix}.min`)}
          rightElement={<Percent />}
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.tediHlrPercent || "-" }}
          rightElement={<Percent />}
        />
      </GridData>
    </>
  )
}
