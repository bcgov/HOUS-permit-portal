import { View } from "@react-pdf/renderer"
import * as R from "ramda"
import React from "react"
import { theme } from "../../../../../../styles/theme"

export function GridItem({ style = {}, children = null }) {
  return (
    <View
      style={R.mergeRight(
        {
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 6,
          paddingBottom: 6,
          paddingLeft: 9,
          paddingRight: 9,
          borderColor: theme.colors.border.light,
          borderRightWidth: 0.75,
        },
        style
      )}
    >
      {children}
    </View>
  )
}
