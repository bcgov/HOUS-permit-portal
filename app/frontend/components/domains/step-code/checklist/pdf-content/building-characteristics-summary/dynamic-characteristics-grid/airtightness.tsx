import { Text, View } from "@react-pdf/renderer"
import { t } from "i18next"
import * as R from "ramda"
import React, { useContext } from "react"
import { theme } from "../../../../../../../styles/theme"
import { i18nPrefix } from "../../../building-characteristics-summary/i18n-prefix"
import { Field } from "../../shared/field"
import { GridItem } from "../../shared/grid-item"
import { HStack } from "../../shared/h-stack"
import { VStack } from "../../shared/v-stack"
import { StepCodeChecklistContext } from "../../step-code-checklist-context"
import { styles } from "../../styles"

export function Airtightness() {
  const { checklist } = useContext(StepCodeChecklistContext)

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
          <View
            style={R.mergeRight(styles.input, {
              width: "100%",
              height: "100%",
              alignItems: "flex-start",
              paddingTop: 3.5,
              paddingBottom: 3.5,
            })}
          >
            <Text>{checklist.buildingCharacteristicsSummary.airtightness.details}</Text>
          </View>
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