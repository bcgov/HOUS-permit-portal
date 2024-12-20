import { Text } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IStepCodeEnergyComplianceReport } from "../../../../../../../../models/step-code-energy-compliance-report"
import { theme } from "../../../../../../../../styles/theme"
import { Field } from "../../../../../step-generic/pdf-content/shared/field"
import { GridItem } from "../../../../../step-generic/pdf-content/shared/grid-item"
import { HStack } from "../../../../../step-generic/pdf-content/shared/h-stack"
import { i18nPrefix } from "../../../energy-step-code-compliance/i18n-prefix"

interface IProps {
  report: IStepCodeEnergyComplianceReport
}
export function EnergyStep({ report }: IProps) {
  return (
    <HStack
      style={{
        width: "100%",
        alignItems: "stretch",
        borderBottomWidth: 0.75,
        borderColor: theme.colors.border.light,
        gap: 0,
      }}
    >
      <GridItem style={{ flexBasis: "25%", minWidth: "25%" }}>
        <Text style={{ fontSize: 10.5 }}>{t(`${i18nPrefix}.step`)}</Text>
      </GridItem>
      <GridItem style={{ flexBasis: "25%", minWidth: "25%" }}>
        <Field value={report.requiredStep} inputStyle={{ justifyContent: "center" }} />
      </GridItem>
      <GridItem
        style={{ flexBasis: "50%", minWidth: "50%", borderRightWidth: 0, backgroundColor: theme.colors.greys.grey04 }}
      />
    </HStack>
  )
}
