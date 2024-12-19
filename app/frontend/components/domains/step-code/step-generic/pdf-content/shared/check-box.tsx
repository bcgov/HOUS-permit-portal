import { View } from "@react-pdf/renderer"
import React from "react"
import { theme } from "../../../../../../styles/theme"

export function CheckBox({ isChecked }) {
  return (
    <View
      style={{
        padding: 1,
        width: 10,
        height: 10,
        backgroundColor: theme.colors.greys.white,
        borderWidth: 0.75,
        borderColor: theme.colors.greys.grey90,
      }}
    >
      <View style={{ width: "100%", height: "100%", backgroundColor: theme.colors.greys.grey90 }} />
    </View>
  )
}
