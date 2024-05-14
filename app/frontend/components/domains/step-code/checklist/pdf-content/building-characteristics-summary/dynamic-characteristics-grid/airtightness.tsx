import { Text, View } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../../models/step-code-checklist"
import { theme } from "../../../../../../../styles/theme"
import { i18nPrefix } from "../../../building-characteristics-summary/i18n-prefix"
import { Field, Input } from "../../shared/field"
import { GridItem } from "../../shared/grid-item"
import { HStack } from "../../shared/h-stack"
import { VStack } from "../../shared/v-stack"

interface IProps {
  checklist: IStepCodeChecklist
}
export function Airtightness({ checklist }: IProps) {
  return (
    <View wrap={false}>
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
          <Text style={{ fontSize: 10.5 }}>{t(`${i18nPrefix}.airtightness`)}</Text>
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
          <Input
            value={checklist.buildingCharacteristicsSummary.airtightness.details}
            inputStyles={{
              width: "100%",
              height: "100%",
              alignItems: "flex-start",
              paddingTop: 3.5,
              paddingBottom: 3.5,
            }}
          />
        </GridItem>
        <GridItem style={{ flexBasis: "50%", minWidth: "50%", borderRightWidth: 0 }}>
          <VStack style={{ width: "100%" }}>
            <HStack style={{ width: "100%" }}>
              <Field value={t(`${i18nPrefix}.ach`)} inputStyle={{ justifyContent: "center" }} />
              <Field value={checklist.ach} inputStyle={{ justifyContent: "center" }} />
            </HStack>
            <HStack style={{ width: "100%" }}>
              <Field value={t(`${i18nPrefix}.nla`)} inputStyle={{ justifyContent: "center" }} />
              <Field value={checklist.nla} inputStyle={{ justifyContent: "center" }} />
            </HStack>
            <HStack style={{ width: "100%" }}>
              <Field value={t(`${i18nPrefix}.nlr`)} inputStyle={{ justifyContent: "center" }} />
              <Field value={checklist.nlr} inputStyle={{ justifyContent: "center" }} />
            </HStack>
          </VStack>
        </GridItem>
      </HStack>
    </View>
  )
}
