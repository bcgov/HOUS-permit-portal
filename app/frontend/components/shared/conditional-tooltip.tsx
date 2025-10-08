import { Box, BoxProps, Tooltip, TooltipProps } from "@chakra-ui/react"
import React from "react"

interface ConditionalTooltipProps extends Omit<TooltipProps, "children" | "label"> {
  showTooltip: boolean
  message: React.ReactNode
  wrapperProps?: BoxProps
  children: React.ReactNode
}

export function ConditionalTooltip({
  showTooltip,
  message,
  wrapperProps,
  children,
  hasArrow = true,
  ...tooltipProps
}: ConditionalTooltipProps) {
  if (!showTooltip) {
    return <>{children}</>
  }

  return (
    <Tooltip label={message} hasArrow={hasArrow} {...tooltipProps}>
      <Box display="inline-block" {...wrapperProps}>
        {children}
      </Box>
    </Tooltip>
  )
}
