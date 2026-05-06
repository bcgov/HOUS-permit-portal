import { Tooltip } from "@/components/ui/tooltip"
import { Badge } from "@chakra-ui/react"
import React from "react"

export function ClauseBadge({ clause, tooltip }: { clause: string; tooltip: string }) {
  return (
    <Tooltip
      content={tooltip}
      fontSize="xs"
      showArrow
      maxW="400px"
      whiteSpace="normal"
      positioning={{
        placement: "top",
      }}
    >
      <Badge
        colorPalette="blue"
        variant="subtle"
        fontSize="2xs"
        fontWeight="semibold"
        letterSpacing="wide"
        cursor="help"
        ml={2}
        verticalAlign="middle"
      >
        {clause}
      </Badge>
    </Tooltip>
  )
}
