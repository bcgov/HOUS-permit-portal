import { Text } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IPart3StepCodeChecklist } from "../../../../../../../models/part-3-step-code-checklist"
import { theme } from "../../../../../../../styles/theme"
import { Field } from "../../../../step-generic/pdf-content/shared/field"
import { GridItem } from "../../../../step-generic/pdf-content/shared/grid-item"
import { HStack } from "../../../../step-generic/pdf-content/shared/h-stack"
import { Panel } from "../../../../step-generic/pdf-content/shared/panel"
import { VStack } from "../../../../step-generic/pdf-content/shared/v-stack"
import { i18nPrefix } from "../../project-info/i18n-prefix"

interface IProps {
  checklist: IPart3StepCodeChecklist
}
export const BaselinePerformance = ({ checklist }: IProps) => {
  const i18nPrefixDetails = `${i18nPrefix}.baselinePerformance`
  return (
    <Panel heading={t(`${i18nPrefixDetails}.heading`)}>
      <Field
        label={t(`${i18nPrefixDetails}.refAnnualThermalEnergyDemand.label`)}
        value={checklist.refAnnualThermalEnergyDemand}
      />

      <AnnualEnergyTable checklist={checklist} />
    </Panel>
  )
}

export const AnnualEnergyTable = ({ checklist }: IProps) => {
  const i18nPrefixDetails = `${i18nPrefix}.baselinePerformance.refEnergyOutputs`
  return (
    <>
      <Text fontSize="md">{t(`${i18nPrefixDetails}.label`)}</Text>
      <VStack wrap={false}>
        <HStack
          style={{
            width: "100%",
            alignItems: "stretch",
            backgroundColor: theme.colors.greys.grey03,
            borderBottomWidth: 0.75,
            borderColor: theme.colors.border.light,
            gap: 0,
          }}
        >
          <GridItem style={{ flexBasis: "25%", minWidth: "25%", textAlign: "center" }}>
            <Text style={{ fontSize: 10.5, fontWeight: 700 }}>{t(`${i18nPrefixDetails}.fuelType`)}</Text>
          </GridItem>
          <GridItem style={{ flexBasis: "25%", minWidth: "25%", textAlign: "center" }}>
            <Text style={{ fontSize: 10.5, fontWeight: 700 }}>{t(`${i18nPrefixDetails}.annualEnergy`)}</Text>
          </GridItem>
          <GridItem style={{ flexBasis: "25%", minWidth: "25%", textAlign: "center" }}>
            <Text style={{ fontSize: 10.5, fontWeight: 700 }}>{t(`${i18nPrefixDetails}.emissionsFactor`)}</Text>
          </GridItem>
          <GridItem style={{ flexBasis: "25%", minWidth: "25%", textAlign: "center", borderRightWidth: 0 }}>
            <Text style={{ fontSize: 10.5, fontWeight: 700 }}>{t(`${i18nPrefixDetails}.emissions`)}</Text>
          </GridItem>
        </HStack>
      </VStack>
    </>
  )
}
