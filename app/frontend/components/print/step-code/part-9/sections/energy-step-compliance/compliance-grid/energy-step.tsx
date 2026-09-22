import React from "react"
import { IStepCodeEnergyComplianceReport } from "../../../../../../../models/step-code-energy-compliance-report"
import { theme } from "../../../../../../../styles/theme"
import { i18nPrefix } from "../../../../../../domains/step-code/part-9/checklist/energy-step-code-compliance/i18n-prefix"
import { reportTranslation as t } from "../../../../../components/report-translation"
import { Field, GridItem, HStack, Text } from "../../../../../components/step-code-primitives"

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
