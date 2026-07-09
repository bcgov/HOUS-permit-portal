import { Badge, BadgeProps } from "@chakra-ui/react"
import React from "react"

interface IUnreadBadgeProps extends BadgeProps {
  count?: number | null
}

export function UnreadBadge({ count, ...badgeProps }: IUnreadBadgeProps) {
  if (count == null || count <= 0) return null

  return (
    <Badge
      bg="theme.blueActive"
      color="white"
      borderRadius="full"
      px={2}
      fontSize="xs"
      minW="20px"
      textAlign="center"
      {...badgeProps}
    >
      {count}
    </Badge>
  )
}
