import { View } from "@react-pdf/renderer"
import * as R from "ramda"
import React from "react"
import { theme } from "../../../../../../styles/theme"

export function Divider({ style = {} }) {
  return (
    <View
      style={R.mergeRight(
        {
          borderTopWidth: 1,
          borderColor: theme.colors.greys.grey02,
          width: "100%",
          marginTop: 12,
          marginBottom: 12,
        },
        style
      )}
    />
  )
}
