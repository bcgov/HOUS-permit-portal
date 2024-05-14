import { View } from "@react-pdf/renderer"
import * as R from "ramda"
import React from "react"

export function HStack({ style = {}, children, ...rest }) {
  return (
    <View
      style={R.mergeRight({ display: "flex", flexDirection: "row", alignItems: "center", gap: 6 }, style)}
      {...rest}
    >
      {children}
    </View>
  )
}
