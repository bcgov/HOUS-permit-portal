import { Text } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../../models/step-code-checklist"
import { theme } from "../../../../../../../styles/theme"
import { EFossilFuelsPresence } from "../../../../../../../types/enums"
import { i18nPrefix } from "../../../building-characteristics-summary/i18n-prefix"
import { Field } from "../../shared/field"
import { GridItem } from "../../shared/grid-item"
import { HStack } from "../../shared/h-stack"

interface IProps {
  checklist: IStepCodeChecklist
}

export function FossilFuels({ checklist }: IProps) {
  const { fossilFuels } = checklist.buildingCharacteristicsSummary

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
          <Text style={{ fontSize: 10.5 }}>{t(`${i18nPrefix}.fossilFuels.label`)}</Text>
        </GridItem>
      </HStack>

      <HStack
        style={{
          width: "100%",
          alignItems: "stretch",
          gap: 0,
        }}
      >
        <GridItem style={{ flexBasis: "100%", minWidth: "100%", borderRightWidth: 0 }}>
          <Field value={t(`${i18nPrefix}.fossilFuels.${fossilFuels.presence as EFossilFuelsPresence}`)} />
        </GridItem>
      </HStack>
      <HStack
        style={{
          width: "100%",
          alignItems: "stretch",
          gap: 0,
        }}
      >
        <GridItem style={{ flexBasis: "100%", minWidth: "100%", borderRightWidth: 0 }}>
          <Field value={fossilFuels.details} />
        </GridItem>
      </HStack>
    </>
  )
}
