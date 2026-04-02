import {
  Avatar,
  Box,
  Circle,
  Flex,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Spinner,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react"
import { Swap, UserPlus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import { IPermitApplication } from "../../../../models/permit-application"
import { useMst } from "../../../../setup/root"
import { IPermitApplicationInboxStore } from "../../../../stores/submission-inbox-store"
import {
  ECollaborationType,
  EPermitApplicationInboxSortFields,
  EPermitApplicationStatus,
} from "../../../../types/enums"
import { ISort } from "../../../../types/types"
import { Paginator } from "../../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../../shared/base/inputs/per-page-select"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { GridHeader } from "../../../shared/grid/grid-header"
import { SearchGrid } from "../../../shared/grid/search-grid"
import { SearchGridItem } from "../../../shared/grid/search-grid-item"
import { PermitApplicationStatusTag } from "../../../shared/permit-applications/permit-application-status-tag"
import { SortIcon } from "../../../shared/sort-icon"
import { SharedAvatar } from "../../../shared/user/shared-avatar"
import { DesignatedCollaboratorAssignmentPopover } from "../../permit-application/collaborator-management/designated-collaborator-assignment-popover"
import { SubmissionInboxMarkUnreadIconButton } from "./submission-inbox-mark-unread-icon-button"

interface IProps {
  searchStore: IPermitApplicationInboxStore
  applications: IPermitApplication[]
}

const MAX_VISIBLE_BLOCK_LEVEL_REVIEW_ASSIGNEE_AVATARS = 3

export const ApplicationInboxTable = observer(function ApplicationInboxTable({ searchStore, applications }: IProps) {
  const { t } = useTranslation()
  const {
    toggleSort,
    sort,
    getSortColumnHeader,
    currentPage,
    totalPages,
    totalCount,
    countPerPage,
    handleCountPerPageChange,
    handlePageChange,
    isSearching,
  } = searchStore

  return (
    <VStack w="full" spacing={5}>
      <SearchGrid
        templateColumns="36px minmax(0, 1.5fr) minmax(0, 1.3fr) minmax(0, 1fr) minmax(140px, 1fr) minmax(160px, 1.1fr) auto 72px"
        gridRowClassName="application-inbox-grid-row"
        sx={{
          ".application-inbox-grid-row:hover > div": {
            bg: "gray.50",
          },
          ".application-inbox-grid-row:active > div": {
            bg: "background.blueLight",
          },
        }}
      >
        <Box display="contents" role="rowgroup">
          <Box display="contents" role="row">
            <GridHeader role="columnheader">
              <Flex w="full" justifyContent="center" borderRight="1px solid" borderColor="border.light" />
            </GridHeader>
            <SortableHeader
              field={EPermitApplicationInboxSortFields.permitType}
              label={getSortColumnHeader(EPermitApplicationInboxSortFields.permitType)}
              sort={sort as ISort<EPermitApplicationInboxSortFields>}
              onToggleSort={toggleSort}
            />
            <SortableHeader
              field={EPermitApplicationInboxSortFields.address}
              label={getSortColumnHeader(EPermitApplicationInboxSortFields.address)}
              sort={sort as ISort<EPermitApplicationInboxSortFields>}
              onToggleSort={toggleSort}
            />
            <SortableHeader
              field={EPermitApplicationInboxSortFields.projectNumber}
              label={getSortColumnHeader(EPermitApplicationInboxSortFields.projectNumber)}
              sort={sort as ISort<EPermitApplicationInboxSortFields>}
              onToggleSort={toggleSort}
            />
            <SortableHeader
              field={EPermitApplicationInboxSortFields.daysInQueue}
              label={getSortColumnHeader(EPermitApplicationInboxSortFields.daysInQueue)}
              sort={sort as ISort<EPermitApplicationInboxSortFields>}
              onToggleSort={toggleSort}
            />
            <SortableHeader
              field={EPermitApplicationInboxSortFields.assigned}
              label={getSortColumnHeader(EPermitApplicationInboxSortFields.assigned)}
              sort={sort as ISort<EPermitApplicationInboxSortFields>}
              onToggleSort={toggleSort}
            />
            <SortableHeader
              field={EPermitApplicationInboxSortFields.status}
              label={getSortColumnHeader(EPermitApplicationInboxSortFields.status)}
              sort={sort as ISort<EPermitApplicationInboxSortFields>}
              onToggleSort={toggleSort}
            />
            <GridHeader role="columnheader" />
          </Box>
        </Box>

        {isSearching ? (
          <Flex py={50} gridColumn="span 8">
            <SharedSpinner />
          </Flex>
        ) : (
          applications.map((application) => <ApplicationInboxRow key={application.id} application={application} />)
        )}
      </SearchGrid>
      <Flex w="full" justifyContent="space-between">
        <PerPageSelect
          handleCountPerPageChange={handleCountPerPageChange}
          countPerPage={countPerPage}
          totalCount={totalCount}
        />
        <Paginator
          current={currentPage}
          total={totalCount}
          totalPages={totalPages}
          pageSize={countPerPage}
          handlePageChange={handlePageChange}
          showLessItems
        />
      </Flex>
    </VStack>
  )
})

const SortableHeader = ({
  field,
  label,
  sort,
  onToggleSort,
}: {
  field: EPermitApplicationInboxSortFields
  label: string
  sort: ISort<EPermitApplicationInboxSortFields>
  onToggleSort: (field: EPermitApplicationInboxSortFields) => void
}) => (
  <GridHeader role="columnheader">
    <Flex
      w="full"
      as="button"
      justifyContent="space-between"
      cursor="pointer"
      onClick={() => onToggleSort(field)}
      borderRight="1px solid"
      borderColor="border.light"
      px={4}
    >
      <Text textAlign="left">{label}</Text>
      <SortIcon<EPermitApplicationInboxSortFields> field={field} currentSort={sort} />
    </Flex>
  </GridHeader>
)

const ApplicationInboxRow = observer(function ApplicationInboxRow({
  application,
}: {
  application: IPermitApplication
}) {
  const { t } = useTranslation()

  return (
    <Box key={application.id} className="application-inbox-grid-row" role="row" display="contents">
      <SearchGridItem justifyContent="center" px={2}>
        <Circle size="8px" bg={!application.isViewed ? "theme.blueActive" : "transparent"} flexShrink={0} />
      </SearchGridItem>

      <SearchGridItem>
        <Box
          as={Link}
          to={`/permit-applications/${application.id}`}
          color="inherit"
          textDecoration="none"
          _hover={{ textDecoration: "none", color: "inherit" }}
        >
          <VStack align="start" spacing={0}>
            <Text fontWeight={700} fontSize="sm" noOfLines={1}>
              {application.nickname || application.permitType?.name || application.permitTypeAndActivity || "—"}
            </Text>
            <Text fontSize="xs" color="text.secondary" noOfLines={1}>
              {application.number}
            </Text>
          </VStack>
        </Box>
      </SearchGridItem>

      <SearchGridItem>
        <VStack align="start" spacing={0}>
          <Text fontSize="sm" noOfLines={1}>
            {application.shortAddress || application.fullAddress || "—"}
          </Text>
          {application.pid ? (
            <Text fontSize="xs" color="text.secondary">
              PID {application.pid}
            </Text>
          ) : (
            <Text fontSize="xs" color="text.secondary">
              —
            </Text>
          )}
        </VStack>
      </SearchGridItem>

      <SearchGridItem>
        {application.projectId && application.projectNumber ? (
          <Box
            as={Link}
            to={`projects/${application.projectId}/overview`}
            color="text.link"
            _hover={{ textDecoration: "underline" }}
          >
            {application.projectNumber}
          </Box>
        ) : (
          <Text fontSize="sm" color="text.secondary">
            —
          </Text>
        )}
      </SearchGridItem>

      <SearchGridItem>
        {application.daysInQueue != null ? (
          <VStack align="start" spacing={0}>
            <Text fontSize="sm">{application.formattedDaysInQueue}</Text>
            <Text fontSize="xs" color="text.secondary">
              {t("submissionInbox.waitingSince")}
            </Text>
            <Text fontSize="xs" color="text.secondary">
              {application.formattedSubmittedAt}
            </Text>
          </VStack>
        ) : (
          <Text fontSize="sm" color="text.secondary">
            —
          </Text>
        )}
      </SearchGridItem>

      <SearchGridItem>
        <ApplicationBlockLevelAndDesignatedAssigneesCell application={application} />
      </SearchGridItem>

      <SearchGridItem>
        <PermitApplicationStatusTag status={application.status} size="sm" px={2} py={0.5} fontSize="xs" />
      </SearchGridItem>

      <SearchGridItem
        px={1}
        justifyContent="center"
        onClick={(e: React.MouseEvent) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <HStack spacing={0}>
          <ApplicationActionsMenu application={application} />
          {application.isViewed && (
            <SubmissionInboxMarkUnreadIconButton onMarkUnread={() => application.markAsUnviewed()} />
          )}
        </HStack>
      </SearchGridItem>
    </Box>
  )
})

const ApplicationBlockLevelAndDesignatedAssigneesCell = observer(
  function ApplicationBlockLevelAndDesignatedAssigneesCell({ application }: { application: IPermitApplication }) {
    const { t } = useTranslation()
    const { permitApplicationStore } = useMst()

    const blockLevelReviewAssigneeUsers = useMemo(() => {
      const designatedReviewerUserId = application.designatedReviewer?.collaborator?.user?.id
      const seenUserIds = new Set<string>(designatedReviewerUserId ? [designatedReviewerUserId] : [])
      const users: { id: string; name: string; role: string }[] = []

      application.getCollaborationAssignees(ECollaborationType.review).forEach((collaboration) => {
        const user = collaboration.collaborator?.user
        if (user && !seenUserIds.has(user.id)) {
          seenUserIds.add(user.id)
          users.push({ id: user.id, name: user.name, role: user.role })
        }
      })

      return users
    }, [application])

    const visibleBlockLevelReviewAssignees = blockLevelReviewAssigneeUsers.slice(
      0,
      MAX_VISIBLE_BLOCK_LEVEL_REVIEW_ASSIGNEE_AVATARS
    )
    const blockLevelReviewAssigneesOverflowCount =
      blockLevelReviewAssigneeUsers.length - MAX_VISIBLE_BLOCK_LEVEL_REVIEW_ASSIGNEE_AVATARS
    const hasDesignatedReviewer = !!application.designatedReviewer
    const hasDesignatedReviewerOrBlockLevelReviewers = hasDesignatedReviewer || blockLevelReviewAssigneeUsers.length > 0

    return (
      <HStack spacing={1}>
        {hasDesignatedReviewerOrBlockLevelReviewers ? (
          <>
            {visibleBlockLevelReviewAssignees.map((user) => (
              <SharedAvatar key={user.id} size="xs" name={user.name} role={user.role} fontSize="2xs" />
            ))}
            {blockLevelReviewAssigneesOverflowCount > 0 && (
              <Avatar
                size="xs"
                name={`+${blockLevelReviewAssigneesOverflowCount}`}
                getInitials={(name) => name}
                bg="gray.200"
                color="text.primary"
                fontSize="2xs"
              />
            )}
          </>
        ) : (
          <Text fontSize="sm" color="text.secondary">
            {t("ui.unassigned")}
          </Text>
        )}
        <DesignatedCollaboratorAssignmentPopover
          permitApplication={application}
          collaborationType={ECollaborationType.review}
          onBeforeOpen={async () => {
            await permitApplicationStore.fetchPermitApplication(application.id, true)
          }}
          renderTrigger={({ isLoading, existingDelegateeCollaboration, onClick, isDisabled }) => (
            <IconButton
              aria-label={t("permitCollaboration.sidebar.title")}
              icon={
                isLoading ? (
                  <Spinner size="xs" />
                ) : existingDelegateeCollaboration ? (
                  <SharedAvatar
                    size="xs"
                    name={existingDelegateeCollaboration.collaborator?.user?.name}
                    role={existingDelegateeCollaboration.collaborator?.user?.role}
                    fontSize="2xs"
                    border="2px solid"
                    borderColor="theme.blueActive"
                  />
                ) : (
                  <UserPlus size={14} />
                )
              }
              size="xs"
              variant="ghost"
              borderRadius="full"
              onClick={onClick}
              isDisabled={isDisabled}
            />
          )}
        />
      </HStack>
    )
  }
)

const ApplicationActionsMenu = observer(function ApplicationActionsMenu({
  application,
}: {
  application: IPermitApplication
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const hasTransitions = application.allowedManualTransitions.length > 0
  const showRevisionsRequestedLink = application.status === EPermitApplicationStatus.inReview

  if (!hasTransitions && !showRevisionsRequestedLink) return null

  return (
    <Menu>
      <Tooltip label={t("submissionInbox.changeStatus")} hasArrow placement="top">
        <MenuButton
          as={IconButton}
          aria-label={t("submissionInbox.changeStatus")}
          icon={<Icon as={Swap} boxSize={4} />}
          size="sm"
          minW={7}
          h={7}
          variant="ghost"
        />
      </Tooltip>
      <Portal>
        <MenuList zIndex={10}>
          {application.allowedManualTransitions.map((transition) => (
            <MenuItem
              key={transition}
              fontSize="sm"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                application.transitionStatus(transition)
              }}
            >
              {/* @ts-ignore */}
              {t(`submissionInbox.applicationStatuses.${transition}`)}
            </MenuItem>
          ))}
          {showRevisionsRequestedLink && (
            <MenuItem
              fontSize="sm"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                navigate(`/permit-applications/${application.id}`)
              }}
            >
              {/* @ts-ignore */}
              {t(`submissionInbox.applicationStatuses.${EPermitApplicationStatus.revisionsRequested}`)}
            </MenuItem>
          )}
        </MenuList>
      </Portal>
    </Menu>
  )
})
