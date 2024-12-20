import { Text, View } from "@react-pdf/renderer"
import * as R from "ramda"
import React from "react"
import { theme } from "../../../../../../styles/theme"

export function Field({ value, label = null, hint = null, rightElement = null, style = {}, inputStyle = {} }) {
  return (
    <View style={R.mergeRight({ width: "100%", fontSize: 10.5 }, style)}>
      {label && (
        <Text
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            width: "100%",
            fontSize: 10.5,
            color: theme.colors.text.primary,
            marginBottom: 3,
          }}
        >
          {label}
        </Text>
      )}
      <Input value={value} inputStyles={inputStyle} rightElement={rightElement} />
      {hint && <Text style={{ color: theme.colors.border.base, fontSize: 10.5, marginTop: 6 }}>{hint}</Text>}
    </View>
  )
}

export function Input({ value, rightElement = null, inputStyles = {} }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 9,
        paddingRight: rightElement ? 30 : 9,
        borderRadius: 3,
        minHeight: 30,
        backgroundColor: theme.colors.greys.grey04,
        color: theme.colors.text.primary,
        fontSize: 10.5,
        ...inputStyles,
      }}
    >
      <Text>{value}</Text>
      {rightElement && (
        <View style={{ position: "absolute", top: 0, right: 0, height: 30, width: 30, justifyContent: "center" }}>
          {rightElement}
        </View>
      )}
    </View>
  )
}
