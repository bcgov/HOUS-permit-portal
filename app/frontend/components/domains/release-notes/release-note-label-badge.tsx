import { Text } from "@chakra-ui/react"
import React from "react"

type ReleaseNoteLabelBadgeProps = Readonly<{
  label: string
  showVersionPrefix?: boolean
}>

export function ReleaseNoteLabelBadge({ label, showVersionPrefix = false }: ReleaseNoteLabelBadgeProps) {
  return (
    <Text
      as="span"
      display="inline-block"
      textTransform={showVersionPrefix ? "uppercase" : undefined}
      fontSize="xs"
      fontWeight="bold"
      letterSpacing="0.05em"
      px={1}
      py={1}
      borderRadius="sm"
      bg="greys.grey03"
      color="text.secondary"
    >
      {showVersionPrefix ? `V.${label}` : label}
    </Text>
  )
}
