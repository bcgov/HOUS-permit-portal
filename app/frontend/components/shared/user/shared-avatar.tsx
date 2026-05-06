import { Avatar } from "@chakra-ui/react"
import React from "react"
import { EUserRoles } from "../../../types/enums"

const roleAvatarBg: Record<string, string> = {
  [EUserRoles.reviewer]: "#4A7FB5",
  [EUserRoles.reviewManager]: "#003366",
  [EUserRoles.regionalReviewManager]: "#6B46C1",
  [EUserRoles.submitter]: "#C6923A",
  [EUserRoles.superAdmin]: "#B83240",
  [EUserRoles.technicalSupport]: "#3B3A39",
}

const DEFAULT_BG = "#4A7FB5"
const DEFAULT_COLOR = "#FFFFFF"

export function getRoleAvatarColors(role?: string | null): { bg: string; color: string } {
  return {
    bg: (role && roleAvatarBg[role]) || DEFAULT_BG,
    color: DEFAULT_COLOR,
  }
}

interface ISharedAvatarProps extends Omit<React.ComponentProps<typeof Avatar.Root>, "bg" | "color"> {
  role?: string | null
}

export const SharedAvatar = React.forwardRef<HTMLSpanElement, ISharedAvatarProps>(function SharedAvatar(
  { role, ...rest },
  ref
) {
  const colors = getRoleAvatarColors(role)
  return (
    <Avatar.Root ref={ref} bg={colors.bg} color={colors.color} {...rest}>
      <Avatar.Fallback />
    </Avatar.Root>
  )
})
