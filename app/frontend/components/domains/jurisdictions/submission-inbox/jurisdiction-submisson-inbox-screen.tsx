import { Box, Button, ButtonGroup, Flex, Heading, HStack, Icon, Text, VStack } from "@chakra-ui/react"
import { CalendarBlank, Columns, List, ListBullets, Stack } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { useJurisdiction } from "../../../../hooks/resources/use-jurisdiction"
import { useSearch } from "../../../../hooks/use-search"
import { useMst } from "../../../../setup/root"
import { EInboxDisplayMode, EInboxViewMode } from "../../../../types/enums"
import { CalloutBanner } from "../../../shared/base/callout-banner"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { ApplicationInboxTable } from "./application-inbox-table"
import { ApplicationKanbanBoard } from "./application-kanban-board"
import {
  AssignedFilter,
  DaysInQueueFilter,
  MeetingRequestsFilter,
  ProjectStatusFilter,
  RequirementTemplateInboxFilter,
  StatusFilter,
  UnreadFilter,
} from "./filters"
import { ProjectInboxTable } from "./project-inbox-table"
import { ProjectKanbanBoard } from "./project-kanban-board"

const KANBAN_PER_PAGE = 50
const LIST_DEFAULT_PER_PAGE = 10

export const JurisdictionSubmissionInboxScreen = observer(function JurisdictionSubmissionInbox() {
  const { t } = useTranslation()
  const { submissionInboxStore, sandboxStore } = useMst()
  const { currentJurisdiction, error } = useJurisdiction()

  const { viewMode, displayMode, setViewMode, setDisplayMode, permitProjectSearch, permitApplicationSearch } =
    submissionInboxStore
  const { currentSandboxId } = sandboxStore

  const activeSearchStore = viewMode === EInboxViewMode.projects ? permitProjectSearch : permitApplicationSearch
  const prevDisplayModeRef = useRef(displayMode)

  useEffect(() => {
    const switchedToColumns =
      displayMode === EInboxDisplayMode.columns && prevDisplayModeRef.current !== EInboxDisplayMode.columns
    const switchedToList =
      displayMode === EInboxDisplayMode.list && prevDisplayModeRef.current !== EInboxDisplayMode.list

    if (switchedToColumns) {
      activeSearchStore.setCountPerPage(KANBAN_PER_PAGE)
      activeSearchStore.search({ countPerPage: KANBAN_PER_PAGE })
    } else if (switchedToList) {
      activeSearchStore.setCountPerPage(LIST_DEFAULT_PER_PAGE)
      activeSearchStore.search({ countPerPage: LIST_DEFAULT_PER_PAGE })
    }

    prevDisplayModeRef.current = displayMode
  }, [displayMode])

  useSearch(activeSearchStore, [currentJurisdiction?.id, JSON.stringify(currentSandboxId), viewMode])

  if (error) return <ErrorScreen error={error} />
  if (!currentJurisdiction) return <LoadingScreen />

  const hasKanbanOverflow = displayMode === EInboxDisplayMode.columns && (activeSearchStore.totalPages ?? 0) > 1

  const overflowBanner = hasKanbanOverflow ? (
    <HStack w="full" justify="center" py={3} spacing={1}>
      <Text fontSize="sm" color="text.secondary">
        {/* @ts-ignore */}
        {t("submissionInbox.kanbanOverflowMessage")}
      </Text>
      <Button variant="link" size="sm" onClick={() => setDisplayMode(EInboxDisplayMode.list)}>
        {/* @ts-ignore */}
        {t("submissionInbox.seeMore")}
      </Button>
    </HStack>
  ) : undefined

  return (
    <Flex as="main" h="calc(100vh - var(--app-navbar-height, 0px))" overflow="hidden">
      {/* Sidebar */}
      <Box
        w="200px"
        minW="200px"
        bg="greys.grey10"
        borderRight="1px solid"
        borderColor="border.light"
        p={4}
        overflowY="auto"
      >
        <Text fontSize="xs" fontWeight="bold" color="text.secondary" mb={4} textTransform="uppercase">
          {t("submissionInbox.workspace")}
        </Text>
        <VStack align="stretch" spacing={1}>
          <Button
            variant="ghost"
            justifyContent="flex-start"
            leftIcon={<ListBullets />}
            bg="white"
            fontWeight="bold"
            size="sm"
          >
            {t("submissionInbox.submissions")}
          </Button>
          {/* ### SUBMISSION INDEX STUB FEATURE */}
          <Button
            variant="ghost"
            justifyContent="flex-start"
            leftIcon={<CalendarBlank />}
            size="sm"
            color="text.secondary"
          >
            {t("submissionInbox.meetings")}
          </Button>
        </VStack>
      </Box>

      {/* Main content */}
      <Flex direction="column" flex={1} minW={0} h="full" overflow="hidden">
        {/* Pinned header: title, search, filters, toggles */}
        <Box flexShrink={0} px={8} pt={8} pb={4}>
          <VStack align="start" spacing={5} w="full">
            {!currentJurisdiction.inboxEnabled && (
              <CalloutBanner type="error" title={t("permitApplication.submissionInbox.contactInviteWarning")} />
            )}

            <Heading as="h1">{t("permitApplication.submissionInbox.title")}</Heading>

            {/* Search bar */}
            <Box w="full">
              <Box
                as="input"
                w="full"
                p={2}
                px={4}
                border="1px solid"
                borderColor="border.light"
                borderRadius="md"
                fontSize="sm"
                placeholder={t("submissionInbox.searchPlaceholder")}
                _placeholder={{ color: "text.secondary" }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  activeSearchStore.setQuery(e.target.value)
                  activeSearchStore.search()
                }}
              />
            </Box>

            {/* Filter bar */}
            <HStack spacing={2} flexWrap="wrap">
              {viewMode === EInboxViewMode.projects && (
                <MeetingRequestsFilter
                  value={activeSearchStore.meetingRequestFilter}
                  onChange={(val) => activeSearchStore.setMeetingRequestFilter(val)}
                  onApply={() => activeSearchStore.search()}
                />
              )}
              <UnreadFilter
                value={activeSearchStore.unreadFilter}
                onChange={(val) => activeSearchStore.setUnreadFilter(val)}
                onApply={() => activeSearchStore.search()}
              />
              <RequirementTemplateInboxFilter
                value={[...activeSearchStore.requirementTemplateIdFilter]}
                onChange={(val) => activeSearchStore.setRequirementTemplateIdFilter(val)}
                onApply={() => activeSearchStore.search()}
                onClear={() => {
                  activeSearchStore.setRequirementTemplateIdFilter([])
                  activeSearchStore.search()
                }}
              />
              {viewMode === EInboxViewMode.projects ? (
                <ProjectStatusFilter
                  value={[...activeSearchStore.statusFilter]}
                  onChange={(val) => activeSearchStore.setStatusFilter(val as any)}
                  onApply={() => activeSearchStore.search()}
                  onClear={() => {
                    activeSearchStore.setStatusFilter([] as any)
                    activeSearchStore.search()
                  }}
                />
              ) : (
                <StatusFilter
                  value={[...activeSearchStore.statusFilter]}
                  onChange={(val) => activeSearchStore.setStatusFilter(val as any)}
                  onApply={() => activeSearchStore.search()}
                  onClear={() => {
                    activeSearchStore.setStatusFilter([] as any)
                    activeSearchStore.search()
                  }}
                />
              )}
              {viewMode === EInboxViewMode.projects && (
                <>
                  <DaysInQueueFilter
                    value={activeSearchStore.daysInQueueFilter}
                    onChange={(val) => activeSearchStore.setDaysInQueueFilter(val)}
                    onApply={() => activeSearchStore.search()}
                    onClear={() => {
                      activeSearchStore.setDaysInQueueFilter(null)
                      activeSearchStore.search()
                    }}
                  />
                  <AssignedFilter
                    value={[...activeSearchStore.assignedFilter]}
                    onChange={(val) => activeSearchStore.setAssignedFilter(val)}
                    onApply={() => activeSearchStore.search()}
                    onClear={() => {
                      activeSearchStore.setAssignedFilter([])
                      activeSearchStore.search()
                    }}
                  />
                </>
              )}
              <Button variant="link" size="sm" onClick={() => activeSearchStore.resetFilters()}>
                {t("submissionInbox.clearAllFilters")}
              </Button>
            </HStack>

            {/* View toggles */}
            <HStack spacing={4}>
              <ButtonGroup isAttached variant="outline" size="sm">
                <Button
                  onClick={() => setViewMode(EInboxViewMode.projects)}
                  bg={viewMode === EInboxViewMode.projects ? "white" : undefined}
                  fontWeight={viewMode === EInboxViewMode.projects ? "bold" : "normal"}
                  borderColor="border.light"
                  leftIcon={<Icon as={Stack} />}
                >
                  {t("submissionInbox.projects")}
                </Button>
                <Button
                  onClick={() => setViewMode(EInboxViewMode.applications)}
                  bg={viewMode === EInboxViewMode.applications ? "white" : undefined}
                  fontWeight={viewMode === EInboxViewMode.applications ? "bold" : "normal"}
                  borderColor="border.light"
                  leftIcon={<Icon as={ListBullets} />}
                >
                  {t("submissionInbox.applications")}
                </Button>
              </ButtonGroup>

              <ButtonGroup isAttached variant="outline" size="sm">
                <Button
                  onClick={() => setDisplayMode(EInboxDisplayMode.list)}
                  bg={displayMode === EInboxDisplayMode.list ? "white" : undefined}
                  fontWeight={displayMode === EInboxDisplayMode.list ? "bold" : "normal"}
                  borderColor="border.light"
                  leftIcon={<Icon as={List} />}
                >
                  {t("submissionInbox.list")}
                </Button>
                <Button
                  onClick={() => setDisplayMode(EInboxDisplayMode.columns)}
                  bg={displayMode === EInboxDisplayMode.columns ? "white" : undefined}
                  fontWeight={displayMode === EInboxDisplayMode.columns ? "bold" : "normal"}
                  borderColor="border.light"
                  leftIcon={<Icon as={Columns} />}
                >
                  {t("submissionInbox.columns")}
                </Button>
              </ButtonGroup>
            </HStack>
          </VStack>
        </Box>

        {/* Content area — columns mode fills exactly; list mode scrolls */}
        <Flex
          direction="column"
          flex={1}
          minH={0}
          overflow={displayMode === EInboxDisplayMode.columns ? "hidden" : "auto"}
          px={8}
          pb={displayMode === EInboxDisplayMode.columns ? 0 : 8}
        >
          <InboxContent
            viewMode={viewMode}
            displayMode={displayMode}
            permitProjectSearch={permitProjectSearch}
            permitApplicationSearch={permitApplicationSearch}
            submissionInboxStore={submissionInboxStore}
            overflowBanner={overflowBanner}
          />
        </Flex>
      </Flex>
    </Flex>
  )
})

const InboxContent = observer(function InboxContent({
  viewMode,
  displayMode,
  permitProjectSearch,
  permitApplicationSearch,
  submissionInboxStore,
  overflowBanner,
}: {
  viewMode: EInboxViewMode
  displayMode: EInboxDisplayMode
  permitProjectSearch: any
  permitApplicationSearch: any
  submissionInboxStore: any
  overflowBanner?: React.ReactNode
}) {
  const activeSearch = viewMode === EInboxViewMode.projects ? permitProjectSearch : permitApplicationSearch

  if (displayMode === EInboxDisplayMode.columns) {
    if (activeSearch.isSearching) {
      return (
        <Flex w="full" justify="center" align="center" minH="400px">
          <SharedSpinner />
        </Flex>
      )
    }

    if (viewMode === EInboxViewMode.projects) {
      return (
        <ProjectKanbanBoard
          projects={permitProjectSearch.tablePermitProjects}
          stateCounts={permitProjectSearch.stateCounts}
          collapsedColumns={[...submissionInboxStore.collapsedColumns]}
          onToggleColumn={(state) => submissionInboxStore.toggleColumnCollapsed(state)}
          overflowBanner={overflowBanner}
          onReorder={(event) => permitProjectSearch.reorderProjects(event.orderedIds)}
        />
      )
    }
    return (
      <ApplicationKanbanBoard
        applications={permitApplicationSearch.tablePermitApplications}
        stateCounts={{}}
        collapsedColumns={[...submissionInboxStore.collapsedColumns]}
        onToggleColumn={(state) => submissionInboxStore.toggleColumnCollapsed(state)}
        overflowBanner={overflowBanner}
      />
    )
  }

  if (viewMode === EInboxViewMode.projects) {
    return <ProjectInboxTable searchStore={permitProjectSearch} projects={permitProjectSearch.tablePermitProjects} />
  }

  return (
    <ApplicationInboxTable
      searchStore={permitApplicationSearch}
      applications={permitApplicationSearch.tablePermitApplications}
    />
  )
})
