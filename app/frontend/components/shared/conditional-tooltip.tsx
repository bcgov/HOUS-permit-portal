import { Box, BoxProps, Tooltip, TooltipProps } from "@chakra-ui/react"
import React, { Children, ReactElement, cloneElement, forwardRef } from "react"

interface ConditionalTooltipProps extends React.HTMLAttributes<HTMLElement> {
  showTooltip: boolean
  message: React.ReactNode
  wrapperProps?: BoxProps
  tooltipProps?: Omit<TooltipProps, "children" | "label">
  children: ReactElement
}

export const ConditionalTooltip = forwardRef<HTMLElement, ConditionalTooltipProps>(function ConditionalTooltip(
  { showTooltip, message, wrapperProps, tooltipProps, children, ...triggerProps },
  ref
) {
  const child = Children.only(children)
  const childWithProps = cloneElement(child, {
    ...triggerProps,
    ref,
  })

  const content = wrapperProps ? (
    <Box display="inline-block" {...wrapperProps}>
      {childWithProps}
    </Box>
  ) : (
    childWithProps
  )

  if (!showTooltip) {
    return content
  }

  const { hasArrow = true, ...restTooltipProps } = tooltipProps ?? {}

  return (
    <Tooltip label={message} hasArrow={hasArrow} {...restTooltipProps}>
      <Box display="inline-block" {...wrapperProps}>
        {childWithProps}
      </Box>
    </Tooltip>
  )
})
