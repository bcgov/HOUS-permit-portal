import { StackDivider, Text, VStack } from "@chakra-ui/react"
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

export const MEUI = function MEUI({ checklist }: IProps) {
  return (
    <>
      <GridRowHeader>
        <Text as="span">{t(`${translationPrefix}.meui`)}</Text>
      </GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.meuiRequirement || "-" }}
          hint={t(`${translationPrefix}.max`)}
          rightElement={
            <VStack spacing={0} divider={<StackDivider color="border.base" />}>
              <UnitsText>{t(`${translationPrefix}.meuiUnits.numerator`)}</UnitsText>
              <UnitsText>{t(`${translationPrefix}.meuiUnits.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.meui || "-" }}
          rightElement={
            <VStack spacing={0} divider={<StackDivider color="border.base" />}>
              <UnitsText>{t(`${translationPrefix}.meuiUnits.numerator`)}</UnitsText>
              <UnitsText>{t(`${translationPrefix}.meuiUnits.denominator`)}</UnitsText>
            </VStack>
          }
        />
      </GridData>
      <GridData rowSpan={2}>
        <RequirementsMetTag success={checklist.meuiPassed} />
      </GridData>

      <GridRowHeader>{t(`${translationPrefix}.meuiImprovement`)}</GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{
            isDisabled: true,
            textAlign: "center",
            value: checklist.meuiPercentImprovementRequirement || "-",
          }}
          hint={t(`${translationPrefix}.min`)}
          rightElement={<Percent />}
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{ isDisabled: true, textAlign: "center", value: checklist.meuiPercentImprovement || "-" }}
          rightElement={<Percent />}
        />
      </GridData>
    </>
  )
}
