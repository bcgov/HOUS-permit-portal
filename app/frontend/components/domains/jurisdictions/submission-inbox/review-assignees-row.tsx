import { Tooltip } from "@/components/ui/tooltip"
import { HStack, IconButton, Spinner, Text } from "@chakra-ui/react"
import { UserPlus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { IUser } from "../../../../models/user"
import { SharedAvatar } from "../../../shared/user/shared-avatar"

interface IReviewAssigneesRowProps {
  /**
   * The designated / delegatee reviewer. This is the only avatar rendered in
   * inbox table rows and kanban cards.
   */
  primaryAssignee?: IUser | null
  /**
   * Text to render when there are no assignees. Omit to render nothing in the
   * empty state (useful for kanban cards where the adjacent + icon carries the
   * affordance to assign).
   */
  emptyText?: string
  avatarSize?: React.ComponentProps<typeof SharedAvatar>["size"]
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
 * kanban card avatar strips. Renders the designated reviewer (if any), an
 * optional "unassigned" label, and whatever assign trigger the consumer passes
 * as children. Block-level collaborators are shown inside the popover, not here.
 */
export const ReviewAssigneesRow = observer(function ReviewAssigneesRow({
  primaryAssignee,
  emptyText,
  avatarSize = "xs",
  spacing = 1,
  children,
}: IReviewAssigneesRowProps) {
  return (
    <HStack gap={spacing}>
      {primaryAssignee ? (
        <Tooltip
          content={primaryAssignee.name}
          showArrow
          openDelay={200}
          positioning={{
            placement: "top",
          }}
        >
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
 * result into either `ProjectReviewCollaboratorsModal` or
 * `DesignatedCollaboratorAssignmentModal`.
 */
export const renderAssignPlusIconTrigger =
  ({ ariaLabel, size = "xs" }: IAssignPlusTriggerOpts) =>
  ({ isLoading, onClick, isDisabled }: ITriggerRenderArgs) => (
    <IconButton
      aria-label={ariaLabel}
      size={size}
      minW={size === "sm" ? 7 : undefined}
      h={size === "sm" ? 7 : undefined}
      variant="ghost"
      borderRadius="full"
      onClick={onClick}
      disabled={isDisabled}
    >
      {isLoading ? <Spinner size="xs" /> : <UserPlus size={size === "sm" ? 16 : 14} />}
    </IconButton>
  )
