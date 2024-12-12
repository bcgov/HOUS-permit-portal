import { Tooltip, TooltipProps } from "@chakra-ui/react"
import { Info } from "@phosphor-icons/react/dist/ssr"
import React from "react"

interface InfoTooltipProps extends Omit<TooltipProps, "children"> {
  iconSize?: number | string
  ariaLabel?: string
}
export function InfoTooltip({ iconSize = 16, ...props }: InfoTooltipProps) {
  return (
    <Tooltip {...props}>
      <Info aria-label={props.ariaLabel} size={iconSize} />
    </Tooltip>
  )
}
