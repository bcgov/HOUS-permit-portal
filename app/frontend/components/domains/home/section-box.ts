import { Box, BoxProps } from "@chakra-ui/react"
import React from "react"

interface ISectionBoxProps extends BoxProps {
  enableCardClick?: boolean
}

export const SectionBox = React.forwardRef<HTMLDivElement, ISectionBoxProps>(
  ({ enableCardClick = true, ...props }, ref) => {
    return React.createElement(Box, {
      ref,
      as: "section",
      borderRadius: "lg",
      borderWidth: 1,
      borderColor: "border.light",
      p: 6,
      w: "full",
      className: enableCardClick ? "jumbo-buttons" : undefined,
      position: "relative",
      transition: enableCardClick ? "border-color 200ms ease-out, background-color 200ms ease-out" : undefined,
      ...(enableCardClick && {
        _hover: {
          borderColor: "theme.blueAlt",
          bg: "theme.BlueLight",
          cursor: "pointer",
        },
      }),
      ...props,
    })
  }
)

SectionBox.displayName = "SectionBox"
