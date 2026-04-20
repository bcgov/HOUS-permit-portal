import { Avatar, AvatarProps, HStack, IconButton, Spinner, Text, Tooltip } from "@chakra-ui/react"
import { UserPlus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { SharedAvatar } from "../../../shared/user/shared-avatar"

export interface IReviewAssigneeUser {
  id: string
  name: string
  role: string
}

interface IReviewAssigneesRowProps {
  /**
   * The designated / delegatee reviewer. Rendered first with a blue border to
   * distinguish them from block-level reviewers.
   */
  primaryAssignee?: IReviewAssigneeUser | null
  /**
   * Block-level review collaborators. Only relevant for permit applications.
   * Rendered without a border, capped at `maxSecondaryVisible` with an overflow
   * counter when exceeded.
   */
  secondaryAssignees?: IReviewAssigneeUser[]
  /**
   * Maximum number of secondary avatars to render before collapsing the rest
   * into a "+N" overflow avatar. Defaults to `Infinity` (no cap).
   */
  maxSecondaryVisible?: number
  /**
   * Text to render when there are no assignees. Omit to render nothing in the
   * empty state (useful for kanban cards where the adjacent + icon carries the
   * affordance to assign).
   */
  emptyText?: string
  avatarSize?: AvatarProps["size"]
  /**
   * Usually the assign-collaborator popover. Rendered immediately after the
   * avatars so the + icon trigger always sits to the right of any assigned
   * avatars.
   */
  children?: React.ReactNode
  /** Spacing between row items. Defaults to 1. */
  spacing?: number | string
}

/**
 * Shared row component for the submission inbox "assigned reviewer" cells and
 * kanban card avatar strips. Renders the designated reviewer (if any), block
 * level reviewers (for applications), an overflow counter, an optional
 * "unassigned" label, and whatever assign trigger the consumer passes as
 * children. Every avatar exposes the user's name on hover.
 */
export const ReviewAssigneesRow = observer(function ReviewAssigneesRow({
  primaryAssignee,
  secondaryAssignees = [],
  maxSecondaryVisible = Infinity,
  emptyText,
  avatarSize = "xs",
  spacing = 1,
  children,
}: IReviewAssigneesRowProps) {
  const visibleSecondary = secondaryAssignees.slice(0, maxSecondaryVisible)
  const overflowCount = Math.max(secondaryAssignees.length - maxSecondaryVisible, 0)
  const hasAnyAssignee = !!primaryAssignee || secondaryAssignees.length > 0

  return (
    <HStack spacing={spacing}>
      {hasAnyAssignee ? (
        <>
          {primaryAssignee && (
            <Tooltip label={primaryAssignee.name} hasArrow placement="top" openDelay={200}>
              <SharedAvatar
                key={primaryAssignee.id}
                size={avatarSize}
                name={primaryAssignee.name}
                role={primaryAssignee.role}
                fontSize="2xs"
                border="2px solid"
                borderColor="theme.blueActive"
              />
            </Tooltip>
          )}
          {visibleSecondary.map((user) => (
            <Tooltip key={user.id} label={user.name} hasArrow placement="top" openDelay={200}>
              <SharedAvatar size={avatarSize} name={user.name} role={user.role} fontSize="2xs" />
            </Tooltip>
          ))}
          {overflowCount > 0 && (
            <Avatar
              size={avatarSize}
              name={`+${overflowCount}`}
              getInitials={(name) => name}
              bg="gray.200"
              color="text.primary"
              fontSize="2xs"
            />
          )}
        </>
      ) : emptyText ? (
        <Text fontSize="sm" color="text.secondary">
          {emptyText}
        </Text>
      ) : null}
      {children}
    </HStack>
  )
})

interface IAssignPlusTriggerOpts {
  ariaLabel: string
  size?: "xs" | "sm"
}

interface ITriggerRenderArgs {
  isLoading: boolean
  onClick: (e: React.MouseEvent) => void
  isDisabled: boolean
}

/**
 * Shared `renderTrigger` factory producing the "+" IconButton used by the
 * assign-collaborator popovers across the submission inbox. Consumers pass the
 * result into either `ProjectReviewCollaboratorsPopover` or
 * `DesignatedCollaboratorAssignmentPopover`.
 */
export const renderAssignPlusIconTrigger =
  ({ ariaLabel, size = "xs" }: IAssignPlusTriggerOpts) =>
  ({ isLoading, onClick, isDisabled }: ITriggerRenderArgs) => (
    <IconButton
      aria-label={ariaLabel}
      icon={isLoading ? <Spinner size="xs" /> : <UserPlus size={size === "sm" ? 16 : 14} />}
      size={size}
      minW={size === "sm" ? 7 : undefined}
      h={size === "sm" ? 7 : undefined}
      variant="ghost"
      borderRadius="full"
      onClick={onClick}
      isDisabled={isDisabled}
    />
  )
