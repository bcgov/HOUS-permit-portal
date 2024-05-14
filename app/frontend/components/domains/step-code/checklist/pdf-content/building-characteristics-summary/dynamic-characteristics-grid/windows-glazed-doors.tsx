import { Text } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../../models/step-code-checklist"
import { theme } from "../../../../../../../styles/theme"
import { EWindowsGlazedDoorsPerformanceType } from "../../../../../../../types/enums"
import { generateUUID } from "../../../../../../../utils/utility-functions"
import { i18nPrefix } from "../../../building-characteristics-summary/i18n-prefix"
import { Field } from "../../shared/field"
import { GridItem } from "../../shared/grid-item"
import { HStack } from "../../shared/h-stack"

interface IProps {
  checklist: IStepCodeChecklist
}
export function WindowsGlazedDoors({ checklist }: IProps) {
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
            flexBasis: "50%",
            maxWidth: "50%",
            justifyContent: "flex-start",
          }}
        >
          <Text style={{ fontSize: 10.5 }}>{t(`${i18nPrefix}.windowsGlazedDoors`)}</Text>
        </GridItem>
        <GridItem
          style={{
            flexBasis: "25%",
            maxWidth: "25%",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 10.5 }}>
            {t(
              `${i18nPrefix}.${checklist.buildingCharacteristicsSummary.windowsGlazedDoors.performanceType as EWindowsGlazedDoorsPerformanceType}`
            )}
          </Text>
        </GridItem>
        <GridItem
          style={{
            flexBasis: "25%",
            maxWidth: "25%",
            borderRightWidth: 0,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 10.5 }}>{t(`${i18nPrefix}.shgc`)}</Text>
        </GridItem>
      </HStack>
      {checklist.buildingCharacteristicsSummary.windowsGlazedDoors.lines.map((line, index) => (
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
            <Field value={line.performanceValue} inputStyle={{ justifyContent: "center" }} />
          </GridItem>
          <GridItem style={{ flexBasis: "25%", minWidth: "25%", borderRightWidth: 0 }}>
            <Field value={line.shgc} inputStyle={{ justifyContent: "center" }} />
          </GridItem>
        </HStack>
      ))}
    </>
  )
}
