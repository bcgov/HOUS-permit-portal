import { Text } from "@react-pdf/renderer"
import { t } from "i18next"
import * as R from "ramda"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../../models/step-code-checklist"
import { theme } from "../../../../../../../styles/theme"
import { ESpaceHeatingCoolingPerformanceType, ESpaceHeatingCoolingVariant } from "../../../../../../../types/enums"
import { generateUUID } from "../../../../../../../utils/utility-functions"
import { i18nPrefix } from "../../../building-characteristics-summary/i18n-prefix"
import { Field } from "../../shared/field"
import { GridItem } from "../../shared/grid-item"
import { HStack } from "../../shared/h-stack"

interface IProps {
  checklist: IStepCodeChecklist
}

export function SpaceHeatingCooling({ checklist }: IProps) {
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
      <HStack
        style={{
          width: "100%",
          alignItems: "stretch",
          gap: 0,
        }}
      >
        <GridItem style={{ flexBasis: "50%", minWidth: "50%" }}>
          <Text style={{ fontSize: 10.5, fontWeight: 700, color: theme.colors.text.primary }}>
            {t(`${i18nPrefix}.principal`)}
          </Text>
        </GridItem>
        <GridItem style={{ flexBasis: "25%", minWidth: "25%" }} />
        <GridItem style={{ flexBasis: "25%", minWidth: "25%", borderRightWidth: 0 }} />
      </HStack>
      <Fields variant={ESpaceHeatingCoolingVariant.principal} checklist={checklist} />
      <HStack
        style={{
          width: "100%",
          alignItems: "stretch",
          gap: 0,
          borderTopWidth: 1,
          borderColor: theme.colors.border.light,
        }}
      >
        <GridItem style={{ flexBasis: "50%", minWidth: "50%" }}>
          <Text style={{ fontSize: 10.5, fontWeight: 700, color: theme.colors.text.primary }}>
            {t(`${i18nPrefix}.secondary`)}
          </Text>
        </GridItem>
        <GridItem style={{ flexBasis: "25%", minWidth: "25%" }} />
        <GridItem style={{ flexBasis: "25%", minWidth: "25%", borderRightWidth: 0 }} />
      </HStack>
      <Fields variant={ESpaceHeatingCoolingVariant.secondary} checklist={checklist} />
    </>
  )
}

interface IFieldsProps {
  variant: ESpaceHeatingCoolingVariant
  checklist: IStepCodeChecklist
}
function Fields({ variant, checklist }: IFieldsProps) {
  const variantLines = R.filter(
    (f) => f.variant == variant,
    checklist.buildingCharacteristicsSummary.spaceHeatingCoolingLines
  )

  return variantLines.map((line, index) => (
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
          value={t(`${i18nPrefix}.${line.performanceType as ESpaceHeatingCoolingPerformanceType}`)}
        />
      </GridItem>
      <GridItem style={{ flexBasis: "25%", minWidth: "25%", borderRightWidth: 0 }}>
        <Field inputStyle={{ justifyContent: "center" }} value={line.performanceValue} />
      </GridItem>
    </HStack>
  ))
}
