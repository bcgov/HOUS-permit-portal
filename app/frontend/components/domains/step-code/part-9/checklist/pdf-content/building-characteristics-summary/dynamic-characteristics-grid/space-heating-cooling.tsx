import { t } from "i18next"
import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../../../models/part-9-step-code-checklist"
import { theme } from "../../../../../../../../styles/theme"
import { ESpaceHeatingCoolingPerformanceType } from "../../../../../../../../types/enums"
import { generateUUID } from "../../../../../../../../utils/utility-functions"
import { Text } from "../../../../../../../shared/pdf/text"
import { i18nPrefix } from "../../../building-characteristics-summary/i18n-prefix"
import { Field } from "../../shared/field"
import { GridItem } from "../../shared/grid-item"
import { HStack } from "../../shared/h-stack"

interface IProps {
  checklist: IPart9StepCodeChecklist
}

// HUB-5472: Flat open lines (no Principal/Secondary headers) to match Rev. 7 BCS UI.
export function SpaceHeatingCooling({ checklist }: IProps) {
  const lines = checklist.buildingCharacteristicsSummary.spaceHeatingCoolingLines

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
          <Text style={{ fontSize: 10.5 }}>{t(`${i18nPrefix}.spaceHeatingCooling`)}</Text>
        </GridItem>
      </HStack>
      {lines.map((line) => (
        <HStack
          key={`spaceHeatingCoolingLine.${generateUUID()}`}
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
              inputStyle={{ justifyContent: "center" }}
              value={
                line.performanceType
                  ? t(`${i18nPrefix}.${line.performanceType as ESpaceHeatingCoolingPerformanceType}`)
                  : ""
              }
            />
          </GridItem>
          <GridItem style={{ flexBasis: "25%", minWidth: "25%", borderRightWidth: 0 }}>
            <Field inputStyle={{ justifyContent: "center" }} value={line.performanceValue} />
          </GridItem>
        </HStack>
      ))}
    </>
  )
}
