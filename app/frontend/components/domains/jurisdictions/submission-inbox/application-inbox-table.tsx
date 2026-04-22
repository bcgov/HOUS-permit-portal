import {
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
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react"
import { Info, Swap } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import { IPermitApplication } from "../../../../models/permit-application"
import { IPermitProject } from "../../../../models/permit-project"
import { IUser } from "../../../../models/user"
import { useMst } from "../../../../setup/root"
import { IPermitApplicationInboxStore } from "../../../../stores/submission-inbox-store"
import {
  ECollaborationType,
  EInboxViewMode,
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
import { SearchGridRow } from "../../../shared/grid/search-grid-row"
import { PermitApplicationStatusTag } from "../../../shared/permit-applications/permit-application-status-tag"
import { SortIcon } from "../../../shared/sort-icon"
import { DesignatedCollaboratorAssignmentPopover } from "../../permit-application/collaborator-management/designated-collaborator-assignment-popover"
import { InboxNoMatchingEmpty } from "./inbox-no-matching-empty"
import { renderAssignPlusIconTrigger, ReviewAssigneesRow } from "./review-assignees-row"
import { SubmissionInboxMarkUnreadIconButton } from "./submission-inbox-mark-unread-icon-button"

interface IProps {
  searchStore: IPermitApplicationInboxStore | IPermitProject
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

  const listShowsNoResults = !isSearching && totalCount !== null && totalCount === 0

  const renderListBody = () => {
    if (isSearching) {
      return (
        <Flex py={50} gridColumn="span 8">
          <SharedSpinner />
        </Flex>
      )
    }
    if (listShowsNoResults) {
      return (
        <Flex py={4} gridColumn="span 8" w="full" justify="flex-start">
          <InboxNoMatchingEmpty
            viewMode={EInboxViewMode.applications}
            onClearFilters={() => searchStore.resetFilters()}
          />
        </Flex>
      )
    }
    return applications.map((application) => <ApplicationInboxRow key={application.id} application={application} />)
  }

  const gridStickyHeaderSx = {
    "[role='columnheader']": {
      position: "sticky",
      top: 0,
      zIndex: 1,
      bg: "white",
    },
  }

  return (
    <Flex direction="column" flex={1} minH={0} minW={0} w="full" align="stretch">
      <Box flex={1} minH={0} overflow="auto">
        <SearchGrid
          templateColumns="36px minmax(0, 1.5fr) minmax(0, 1.3fr) minmax(0, 1fr) minmax(140px, 1fr) minmax(160px, 1.1fr) auto 72px"
          gridRowClassName="application-inbox-grid-row"
          overflow="visible"
          sx={gridStickyHeaderSx}
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
                tooltip={t("submissionInbox.daysWithUsTooltip")}
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

          {renderListBody()}
        </SearchGrid>
      </Box>
      {!listShowsNoResults && (
        <Flex
          w="full"
          flexShrink={0}
          justifyContent="space-between"
          align="center"
          pt={5}
          borderTopWidth="1px"
          borderTopColor="border.light"
          bg="white"
        >
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
      )}
    </Flex>
  )
})

const SortableHeader = ({
  field,
  label,
  sort,
  onToggleSort,
  tooltip,
}: {
  field: EPermitApplicationInboxSortFields
  label: string
  sort: ISort<EPermitApplicationInboxSortFields>
  onToggleSort: (field: EPermitApplicationInboxSortFields) => void
  tooltip?: string
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
      <HStack spacing={1}>
        <Text textAlign="left">{label}</Text>
        {tooltip && (
          <Tooltip label={tooltip} hasArrow placement="top">
            <Flex align="center">
              <Icon as={Info} boxSize={3.5} color="text.secondary" />
            </Flex>
          </Tooltip>
        )}
      </HStack>
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
  const navigate = useNavigate()

  return (
    <SearchGridRow
      key={application.id}
      className="application-inbox-grid-row"
      onClick={() => navigate(`/permit-applications/${application.id}`)}
      _hover={{ bg: "gray.50", cursor: "pointer" }}
      _active={{ bg: "background.blueLight" }}
    >
      <SearchGridItem justifyContent="center" px={2}>
        <Circle size="8px" bg={!application.isViewed ? "theme.blueActive" : "transparent"} flexShrink={0} />
      </SearchGridItem>

      <SearchGridItem>
        <VStack align="start" spacing={0}>
          <Text fontWeight={700} fontSize="sm" noOfLines={1}>
            {application.nickname || application.permitType?.name || application.permitTypeAndActivity || "—"}
          </Text>
          <Text fontSize="xs" color="text.secondary" noOfLines={1}>
            {application.number}
          </Text>
        </VStack>
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
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
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

      <SearchGridItem
        onClick={(e: React.MouseEvent) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
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
    </SearchGridRow>
  )
})

const ApplicationBlockLevelAndDesignatedAssigneesCell = observer(
  function ApplicationBlockLevelAndDesignatedAssigneesCell({ application }: { application: IPermitApplication }) {
    const { t } = useTranslation()
    const { permitApplicationStore } = useMst()

    const primaryAssignee = application.designatedReviewer?.collaborator?.user ?? null

    const secondaryAssignees = useMemo(() => {
      const seenUserIds = new Set<string>(primaryAssignee ? [primaryAssignee.id] : [])
      const users: IUser[] = []

      application.getCollaborationAssignees(ECollaborationType.review).forEach((collaboration) => {
        const user = collaboration.collaborator?.user
        if (user && !seenUserIds.has(user.id)) {
          seenUserIds.add(user.id)
          users.push(user)
        }
      })

      return users
    }, [application, primaryAssignee])

    return (
      <ReviewAssigneesRow
        primaryAssignee={primaryAssignee}
        secondaryAssignees={secondaryAssignees}
        maxSecondaryVisible={MAX_VISIBLE_BLOCK_LEVEL_REVIEW_ASSIGNEE_AVATARS}
        emptyText={t("ui.unassigned")}
      >
        <DesignatedCollaboratorAssignmentPopover
          permitApplication={application}
          collaborationType={ECollaborationType.review}
          onBeforeOpen={async () => {
            await permitApplicationStore.fetchPermitApplication(application.id, true)
          }}
          renderTrigger={renderAssignPlusIconTrigger({ ariaLabel: t("permitCollaboration.sidebar.title") })}
        />
      </ReviewAssigneesRow>
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
