import { Box, Tooltip, TooltipProps } from "@chakra-ui/react"
import { IconProps, Info } from "@phosphor-icons/react"
import React from "react"

interface IWithConditionalTooltipProps {
  children: React.ReactNode
  passesCondition: boolean
  tooltipProps: Partial<TooltipProps>
  showTooltipIcon?: boolean
  renderTooltipIcon?: (props: IconProps) => React.ReactNode
  tooltipIconProps?: {
    relativePlacement?: {
      top?: number | string
      right?: number | string
      left?: number | string
      bottom?: number | string
    }
  } & IconProps
}

/**
 * A component that conditionally wraps its children in a tooltip with optional icon
 * @param props.children - The content to potentially wrap in a tooltip
 * @param props.passesCondition - Whether to show the tooltip or not
 * @param props.tooltipProps - Props to pass to the Tooltip component
 * @param props.showIcon - Whether to show the icon (defaults to false)
 * @param props.icon - Icon component to use (defaults to Info)
 * @param props.iconProps - Props passed to the icon component
 */
export function WithConditionalTooltip({
  children,
  passesCondition,
  tooltipProps,
  showTooltipIcon = false,
  renderTooltipIcon,
  tooltipIconProps,
}: IWithConditionalTooltipProps) {
  const { relativePlacement = { top: "-16px", right: "-8px" }, ...iconProps } = tooltipIconProps ?? {}
  const content = (
    <Box position="relative" display="inline-block">
      {children}
      {showTooltipIcon && (
        <Box position="absolute" {...relativePlacement}>
          {renderTooltipIcon ? renderTooltipIcon(iconProps) : <Info size={16} {...iconProps} />}
        </Box>
      )}
    </Box>
  )

  return passesCondition ? <Tooltip {...tooltipProps}>{content}</Tooltip> : content
}
