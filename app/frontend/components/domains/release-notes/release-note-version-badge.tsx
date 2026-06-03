import { Text } from "@chakra-ui/react"
import React from "react"

type ReleaseNoteVersionBadgeProps = Readonly<{
  version: string
  isHighlighted?: boolean
}>

export function ReleaseNoteVersionBadge({ version, isHighlighted = false }: ReleaseNoteVersionBadgeProps) {
  return (
    <Text
      as="span"
      display="inline-block"
      textTransform="uppercase"
      fontSize="xs"
      fontWeight="bold"
      letterSpacing="0.05em"
      px={1}
      py={1}
      borderRadius="sm"
      bg={isHighlighted ? "theme.yellowLight" : "greys.grey03"}
      color={isHighlighted ? "text.primary" : "text.secondary"}
      boxShadow={isHighlighted ? "0 0 0 2px var(--chakra-colors-theme-yellow)" : undefined}
      transition="background-color 200ms ease, color 200ms ease, box-shadow 200ms ease"
    >
      V.{version}
    </Text>
  )
}
