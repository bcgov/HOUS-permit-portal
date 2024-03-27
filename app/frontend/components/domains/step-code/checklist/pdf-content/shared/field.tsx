import { Text, View } from "@react-pdf/renderer"
import * as R from "ramda"
import React from "react"
import { theme } from "../../../../../../styles/theme"
import { styles } from "../styles"

export function Field({ value, label = null, hint = null, rightElement = null, style = {}, inputStyle = {} }) {
  return (
    <View style={R.mergeRight({ width: "100%", fontSize: 10.5 }, style)}>
      {label && <Text style={styles.labelText}>{label}</Text>}
      <View style={{ ...styles.input, paddingRight: rightElement ? 30 : styles.input.paddingRight, ...inputStyle }}>
        <Text>{value}</Text>
        {rightElement && (
          <View style={{ position: "absolute", top: 0, right: 0, height: 30, width: 30, justifyContent: "center" }}>
            {rightElement}
          </View>
        )}
      </View>
      {hint && <Text style={{ color: theme.colors.border.base, fontSize: 10.5, marginTop: 6 }}>{hint}</Text>}
    </View>
  )
}
