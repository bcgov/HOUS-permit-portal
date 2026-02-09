import { Box, BoxProps } from "@chakra-ui/react"
import React from "react"

export const SectionBox = React.forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
  return React.createElement(Box, {
    ref,
    as: "section",
    borderRadius: "lg",
    borderWidth: 1,
    borderColor: "border.light",
    p: 6,
    w: "full",
    className: "jumbo-buttons",
    position: "relative",
    transition: "border-color 200ms ease-out",
    _hover: {
      borderColor: "theme.blueAlt",
      bg: "theme.BlueLight",
    },
    ...props,
  })
})

SectionBox.displayName = "SectionBox"
