import { View } from "@react-pdf/renderer"
import * as R from "ramda"
import React from "react"

export function VStack({ style = {}, children, ...rest }) {
  return (
    <View
      style={R.mergeRight({ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }, style)}
      {...rest}
    >
      {children}
    </View>
  )
}
