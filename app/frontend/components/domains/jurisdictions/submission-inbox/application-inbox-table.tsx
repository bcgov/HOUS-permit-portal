import { Avatar, Box, Circle, Flex, HStack, IconButton, Spinner, Text, useDisclosure, VStack } from "@chakra-ui/react"
import { UserPlus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { IPermitApplication } from "../../../../models/permit-application"
import { useMst } from "../../../../setup/root"
import { IPermitApplicationInboxStore } from "../../../../stores/submission-inbox-store"
import { ECollaborationType, EPermitApplicationInboxSortFields } from "../../../../types/enums"
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
import { CollaboratorsSidebarDrawer } from "../../permit-application/collaborator-management/collaborators-sidebar"

interface IProps {
  searchStore: IPermitApplicationInboxStore
  applications: IPermitApplication[]
}

const MAX_VISIBLE_AVATARS = 3

function formatWaitingSince(date: Date | null | undefined) {
  if (!date) return "—"
  return new Intl.DateTimeFormat("en-CA").format(date)
}

function formatQueueAge(days: number | null) {
  if (days == null) return "—"
  return `${days} ${days === 1 ? "day" : "days"}`
}

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
        templateColumns="36px minmax(0, 1.5fr) minmax(0, 1.3fr) minmax(0, 1fr) minmax(140px, 1fr) minmax(160px, 1.1fr) auto"
        gridRowClassName="application-inbox-grid-row"
        sx={{
          ".application-inbox-grid-row:hover > div": {
            bg: "blue.50",
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
          </Box>
        </Box>

        {isSearching ? (
          <Flex py={50} gridColumn="span 7">
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
            fontWeight={600}
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
            <Text fontSize="sm">{formatQueueAge(application.daysInQueue)}</Text>
            <Text fontSize="xs" color="text.secondary">
              {t("submissionInbox.waitingSince")}
            </Text>
            <Text fontSize="xs" color="text.secondary">
              {formatWaitingSince(application.enqueuedAt)}
            </Text>
          </VStack>
        ) : (
          <Text fontSize="sm" color="text.secondary">
            —
          </Text>
        )}
      </SearchGridItem>

      <SearchGridItem>
        <ApplicationAssignedCell application={application} />
      </SearchGridItem>

      <SearchGridItem>
        <PermitApplicationStatusTag status={application.status} size="sm" px={2} py={0.5} fontSize="xs" />
      </SearchGridItem>
    </Box>
  )
})

const ApplicationAssignedCell = observer(function ApplicationAssignedCell({
  application,
}: {
  application: IPermitApplication
}) {
  const { t } = useTranslation()
  const { permitApplicationStore } = useMst()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isLoadingSidebar, setIsLoadingSidebar] = useState(false)

  const avatarUsers = useMemo(() => {
    const designatedReviewerUser = application.designatedReviewer?.collaborator?.user
    const seenUserIds = new Set(designatedReviewerUser ? [designatedReviewerUser.id] : [])
    const users = designatedReviewerUser
      ? [
          {
            id: designatedReviewerUser.id,
            name: designatedReviewerUser.name,
            role: designatedReviewerUser.role,
            isDesignated: true,
          },
        ]
      : []

    application.getCollaborationAssignees(ECollaborationType.review).forEach((collaboration) => {
      const user = collaboration.collaborator?.user
      if (user && !seenUserIds.has(user.id)) {
        seenUserIds.add(user.id)
        users.push({ id: user.id, name: user.name, role: user.role, isDesignated: false })
      }
    })

    return users
  }, [application])

  const visibleAvatars = avatarUsers.slice(0, MAX_VISIBLE_AVATARS)
  const overflowCount = avatarUsers.length - MAX_VISIBLE_AVATARS

  const handleOpenSidebar = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLoadingSidebar(true)
    try {
      await permitApplicationStore.fetchPermitApplication(application.id, true)
    } finally {
      setIsLoadingSidebar(false)
    }
    onOpen()
  }

  return (
    <>
      <HStack spacing={1}>
        {visibleAvatars.length > 0 ? (
          <>
            {visibleAvatars.map((user) => (
              <SharedAvatar
                key={user.id}
                size="xs"
                name={user.name}
                role={user.role}
                fontSize="2xs"
                border={user.isDesignated ? "2px solid" : undefined}
                borderColor={user.isDesignated ? "theme.blueActive" : undefined}
              />
            ))}
            {overflowCount > 0 && (
              <Avatar
                size="xs"
                name={`+${overflowCount}`}
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
        <IconButton
          aria-label={t("permitCollaboration.sidebar.title")}
          icon={isLoadingSidebar ? <Spinner size="xs" /> : <UserPlus size={14} />}
          size="xs"
          variant="ghost"
          borderRadius="full"
          onClick={handleOpenSidebar}
          isDisabled={isLoadingSidebar}
        />
      </HStack>

      {isOpen && (
        <CollaboratorsSidebarDrawer
          permitApplication={application}
          collaborationType={ECollaborationType.review}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}
    </>
  )
})
