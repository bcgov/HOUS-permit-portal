import { Badge, Tooltip } from "@chakra-ui/react"
import React from "react"

export function ClauseBadge({ clause, tooltip }: { clause: string; tooltip: string }) {
  return (
    <Tooltip label={tooltip} fontSize="xs" placement="top" hasArrow maxW="400px" whiteSpace="normal">
      <Badge
        colorScheme="blue"
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
