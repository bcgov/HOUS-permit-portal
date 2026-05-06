import { Box, HoverCard, HStack, Portal, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { IPermitProject } from "../../../../models/permit-project"
import { EPermitApplicationStatus } from "../../../../types/enums"
import { PermitApplicationStatusTag } from "../../../shared/permit-applications/permit-application-status-tag"

const DRAFT_LINK_DISABLED_STATUSES = new Set<string>([
  EPermitApplicationStatus.newDraft,
  EPermitApplicationStatus.revisionsRequested,
])

export interface IProjectInboxPermitApplicationsPopoverProps {
  project: IPermitProject
  /** When omitted, uses the rollup status tag (kanban default). */
  renderTrigger?: React.ReactNode
}

export const ProjectInboxPermitApplicationsPopover = observer(function ProjectInboxPermitApplicationsPopover({
  project,
  renderTrigger,
}: IProjectInboxPermitApplicationsPopoverProps) {
  const { t } = useTranslation()
  const rollupStatus = project.inboxRollupStatus
  const sortedStatuses = project.inboxSortedApplicationStatuses

  const defaultTrigger = (
    <PermitApplicationStatusTag status={rollupStatus} size="sm" px={2} py={0.5} fontSize="2xs" cursor="default" />
  )

  const trigger = renderTrigger ?? defaultTrigger
  const useCustomTrigger = renderTrigger != null

  if (!useCustomTrigger && sortedStatuses.length === 0) return null
  if (!useCustomTrigger && sortedStatuses.length === 1) return defaultTrigger
  if (useCustomTrigger && sortedStatuses.length === 0) {
    return <>{trigger}</>
  }

  const popoverBody = (
    <Box p={3}>
      <Text fontSize="2xs" fontWeight="bold" textTransform="uppercase" color="text.secondary" mb={2}>
        {t("submissionInbox.permitApplicationStatuses")}
      </Text>
      <VStack align="stretch" gap={1}>
        {sortedStatuses.map((entry, idx) => {
          const linkDisabled = DRAFT_LINK_DISABLED_STATUSES.has(entry.status)
          const label = entry.nickname || "—"
          return (
            <HStack key={idx} gap={2} justify="space-between">
              {linkDisabled ? (
                <Text
                  fontSize="xs"
                  color="text.secondary"
                  lineClamp={1}
                  cursor="default"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  {label}
                </Text>
              ) : (
                <Text fontSize="xs" color="text.link" lineClamp={1} _hover={{ textDecoration: "underline" }} asChild>
                  <Link to={`/permit-applications/${entry.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    {label}
                  </Link>
                </Text>
              )}
              <PermitApplicationStatusTag
                status={entry.status}
                size="sm"
                px={1.5}
                py={0.5}
                fontSize="2xs"
                flexShrink={0}
              />
            </HStack>
          )
        })}
      </VStack>
    </Box>
  )

  return (
    <HoverCard.Root
      lazyMount
      positioning={{
        placement: "right-end",
        flip: false,
      }}
    >
      <HoverCard.Trigger asChild>
        <Box as="span" display="inline-block" maxW="100%">
          {trigger}
        </Box>
      </HoverCard.Trigger>
      <Portal>
        <HoverCard.Positioner>
          <HoverCard.Content w="auto" minW="220px" maxW="320px" onClick={(e) => e.preventDefault()}>
            {popoverBody}
          </HoverCard.Content>
        </HoverCard.Positioner>
      </Portal>
    </HoverCard.Root>
  )
})
