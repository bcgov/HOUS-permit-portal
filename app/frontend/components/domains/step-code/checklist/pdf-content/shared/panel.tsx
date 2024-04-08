import { Text, View } from "@react-pdf/renderer"
import React from "react"
import { theme } from "../../../../../../styles/theme"

export function Panel({ heading, children, ...rest }) {
  return (
    <View
      style={{ borderWidth: 0.75, borderColor: theme.colors.greys.grey02, borderRadius: 6, width: "100%" }}
      {...rest}
    >
      <View
        style={{
          paddingTop: 6,
          paddingBottom: 6,
          paddingLeft: 18,
          paddingRight: 18,
          backgroundColor: theme.colors.greys.grey04,
          color: theme.colors.text.primary,
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
          borderBottomWidth: 0.75,
          borderColor: theme.colors.greys.grey02,
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: 700 }}>{heading}</Text>
      </View>
      <View
        style={{
          paddingLeft: 18,
          paddingRight: 18,
          paddingTop: 9,
          paddingBottom: 9,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          gap: 12,
          borderRadius: 6,
        }}
      >
        {children}
      </View>
    </View>
  )
}
