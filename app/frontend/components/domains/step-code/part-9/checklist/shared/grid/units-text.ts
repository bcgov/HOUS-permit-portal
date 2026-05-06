import { Text, TextProps } from "@chakra-ui/react"
import React from "react"

export const UnitsText = (props: TextProps) => {
  return React.createElement(Text, { fontSize: "xxs", color: "border.base", as: "span", ...props })
}
