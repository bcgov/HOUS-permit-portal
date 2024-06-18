import { Text } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IStepCodeZeroCarbonComplianceReport } from "../../../../../../../models/step-code-zero-carbon-compliance-report"
import { theme } from "../../../../../../../styles/theme"
import { i18nPrefix } from "../../../zero-carbon-step-code-compliance/i18n-prefix"
import { Field } from "../../shared/field"
import { GridItem } from "../../shared/grid-item"
import { HStack } from "../../shared/h-stack"

interface IProps {
  report: IStepCodeZeroCarbonComplianceReport
}

export function ZeroCarbonStep({ report }: IProps) {
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
