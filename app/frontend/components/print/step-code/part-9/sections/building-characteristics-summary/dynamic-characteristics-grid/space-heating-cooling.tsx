import * as R from "ramda"
import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../../models/part-9-step-code-checklist"
import { theme } from "../../../../../../../styles/theme"
import { ESpaceHeatingCoolingPerformanceType, ESpaceHeatingCoolingVariant } from "../../../../../../../types/enums"
import { generateUUID } from "../../../../../../../utils/utility-functions"
import { i18nPrefix } from "../../../../../../domains/step-code/part-9/checklist/building-characteristics-summary/i18n-prefix"
import { reportTranslation as t } from "../../../../../components/report-translation"
import { Field, GridItem, HStack, Text } from "../../../../../components/step-code-primitives"

interface IProps {
  checklist: IPart9StepCodeChecklist
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
  checklist: IPart9StepCodeChecklist
}
function Fields({ variant, checklist }: IFieldsProps) {
  const variantLines = R.filter(
    (f: any) => f.variant == variant,
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
