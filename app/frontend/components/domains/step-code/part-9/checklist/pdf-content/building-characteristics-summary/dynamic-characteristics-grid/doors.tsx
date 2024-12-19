import { Text } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../../../models/part-9-step-code-checklist"
import { theme } from "../../../../../../../../styles/theme"
import { EDoorsPerformanceType } from "../../../../../../../../types/enums"
import { generateUUID } from "../../../../../../../../utils/utility-functions"
import { Field } from "../../../../../step-generic/pdf-content/shared/field"
import { GridItem } from "../../../../../step-generic/pdf-content/shared/grid-item"
import { HStack } from "../../../../../step-generic/pdf-content/shared/h-stack"
import { i18nPrefix } from "../../../building-characteristics-summary/i18n-prefix"

interface IProps {
  checklist: IPart9StepCodeChecklist
}

export function Doors({ checklist }: IProps) {
  return (
    <>
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
        <GridItem
          style={{
            flexBasis: "100%",
            maxWidth: "100%",
            borderRightWidth: 0,
          }}
        >
          <Text style={{ fontSize: 10.5 }}>{t(`${i18nPrefix}.doors`)}</Text>
        </GridItem>
      </HStack>
      {checklist.buildingCharacteristicsSummary.doorsLines.map((line, index) => (
        <HStack
          key={generateUUID()}
          style={{
            width: "100%",
            alignItems: "stretch",
            gap: 0,
          }}
        >
          <GridItem style={{ flexBasis: "50%", minWidth: "50%" }}>
            <Field value={line.details} />
          </GridItem>
          <GridItem style={{ flexBasis: "25%", minWidth: "25%" }}>
            <Field
              value={t(`${i18nPrefix}.${line.performanceType as EDoorsPerformanceType}`)}
              inputStyle={{ justifyContent: "center" }}
            />
          </GridItem>
          <GridItem style={{ flexBasis: "25%", minWidth: "25%", borderRightWidth: 0 }}>
            <Field value={line.performanceValue} inputStyle={{ justifyContent: "center" }} />
          </GridItem>
        </HStack>
      ))}
    </>
  )
}
