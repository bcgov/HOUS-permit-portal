import { Text, View } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { theme } from "../../../../../../styles/theme"

export function RequirementsMetTag({ success }) {
  const i18nPrefix = "stepCodeChecklist.edit.complianceGrid.requirementsMetTag"
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 6,
        paddingRight: 6,
        minWidth: 18,
        minHeight: 18,
        borderRadius: 4.5,
        backgroundColor: success ? theme.colors.semantic.successLight : theme.colors.semantic.errorLight,
        color: theme.colors.text.secondary,
        textTransform: "uppercase",
      }}
    >
      {/* TODO: icon */}
      {/* <TagLeftIcon boxSize="12px" as={success ? Check : X} /> */}
      <Text style={{ fontSize: 10.5 }}>{success ? t(`${i18nPrefix}.pass`) : t(`${i18nPrefix}.fail`)}</Text>
    </View>
  )
}
