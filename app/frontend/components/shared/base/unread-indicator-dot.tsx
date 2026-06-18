import { Circle, CircleProps } from "@chakra-ui/react"
import React from "react"

interface IUnreadIndicatorDotProps extends CircleProps {
  isUnread?: boolean
}

export function UnreadIndicatorDot({ isUnread = true, ...circleProps }: IUnreadIndicatorDotProps) {
  return (
    <Circle size="8px" bg={isUnread ? "theme.blueActive" : "transparent"} flexShrink={0} aria-hidden {...circleProps} />
  )
}
