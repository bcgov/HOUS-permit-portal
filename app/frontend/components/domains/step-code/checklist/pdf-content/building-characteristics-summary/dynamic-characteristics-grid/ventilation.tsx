import { Text } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../../models/step-code-checklist"
import { theme } from "../../../../../../../styles/theme"
import { generateUUID } from "../../../../../../../utils/utility-functions"
import { i18nPrefix } from "../../../building-characteristics-summary/i18n-prefix"
import { Field } from "../../shared/field"
import { GridItem } from "../../shared/grid-item"
import { HStack } from "../../shared/h-stack"

interface IProps {
  checklist: IStepCodeChecklist
}
export function Ventilation({ checklist }: IProps) {
  const lines = checklist.buildingCharacteristicsSummary.ventilationLines
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
          <Text style={{ fontSize: 10.5 }}>{t(`${i18nPrefix}.ventilation`)}</Text>
        </GridItem>
      </HStack>
      {lines.map((line, index) => (
        <HStack
          key={generateUUID()}
          style={{
            width: "100%",
            alignItems: "stretch",
            gap: 0,
          }}
        >
          <GridItem style={{ flexBasis: "50%", minWidth: "50%", alignItems: "flex-start" }}>
            <Field value={line.details} />
          </GridItem>
          <GridItem style={{ flexBasis: "25%", minWidth: "25%" }}>
            <Field
              value={line.percent_eff}
              hint={index == lines.length - 1 && t(`${i18nPrefix}.percent_eff`)}
              inputStyle={{ justifyContent: "center" }}
            />
          </GridItem>
          <GridItem style={{ flexBasis: "25%", minWidth: "25%", borderRightWidth: 0 }}>
            <Field
              value={line.litersPerSec}
              hint={index == lines.length - 1 && t(`${i18nPrefix}.litersPerSec`)}
              inputStyle={{ justifyContent: "center" }}
            />
          </GridItem>
        </HStack>
      ))}
    </>
  )
}
