import { Box, Button, ButtonGroup, Circle, Flex, Heading, HStack, Icon, Text, VStack } from "@chakra-ui/react"
import { CalendarBlank, Columns, List, ListBullets, Stack } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { useJurisdiction } from "../../../../hooks/resources/use-jurisdiction"
import { usePopStateModeSync } from "../../../../hooks/use-popstate-mode-sync"
import { useSearch } from "../../../../hooks/use-search"
import { useMst } from "../../../../setup/root"
import { EInboxDisplayMode, EInboxViewMode, EPermitApplicationStatus } from "../../../../types/enums"
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
  RequirementTemplateInboxFilter,
  UnreadFilter,
} from "./filters"
import { ProjectInboxTable } from "./project-inbox-table"
import { ProjectKanbanBoard } from "./project-kanban-board"

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

  usePopStateModeSync(submissionInboxStore)

  useEffect(() => {
    const switchedToColumns =
      displayMode === EInboxDisplayMode.columns && prevDisplayModeRef.current !== EInboxDisplayMode.columns
    const switchedToList =
      displayMode === EInboxDisplayMode.list && prevDisplayModeRef.current !== EInboxDisplayMode.list

    if (switchedToColumns) {
      activeSearchStore.setStatusFilter([] as any)
      activeSearchStore.search()
    } else if (switchedToList) {
      activeSearchStore.setCountPerPage(LIST_DEFAULT_PER_PAGE)
      activeSearchStore.search({ countPerPage: LIST_DEFAULT_PER_PAGE })
    }

    prevDisplayModeRef.current = displayMode
  }, [displayMode])

  useSearch(activeSearchStore, [currentJurisdiction?.id, JSON.stringify(currentSandboxId), viewMode])

  if (error) return <ErrorScreen error={error} />
  if (!currentJurisdiction) return <LoadingScreen />

  const handleShowMore = (columnState: string) => {
    setDisplayMode(EInboxDisplayMode.list)
    if (viewMode === EInboxViewMode.projects) {
      permitProjectSearch.setStatusFilter([columnState])
      permitProjectSearch.setCountPerPage(LIST_DEFAULT_PER_PAGE)
      permitProjectSearch.search({ countPerPage: LIST_DEFAULT_PER_PAGE })
    } else {
      permitApplicationSearch.setStatusFilter([columnState as EPermitApplicationStatus])
      permitApplicationSearch.setCountPerPage(LIST_DEFAULT_PER_PAGE)
      permitApplicationSearch.search({ countPerPage: LIST_DEFAULT_PER_PAGE })
    }
  }

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

            {/* Search bar + view toggles */}
            <HStack w="full" spacing={4}>
              <Box
                as="input"
                flex={1}
                minW={0}
                maxW="50%"
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

              <HStack spacing={3} flexShrink={0}>
                <ButtonGroup isAttached variant="outline" size="sm">
                  <Button
                    onClick={() => setViewMode(EInboxViewMode.projects)}
                    fontWeight={viewMode === EInboxViewMode.projects ? "bold" : "normal"}
                    borderColor={viewMode === EInboxViewMode.projects ? "theme.blueActive" : "border.light"}
                    leftIcon={<RadioDot active={viewMode === EInboxViewMode.projects} />}
                    rightIcon={<Icon as={Stack} />}
                  >
                    {t("submissionInbox.projects")}
                  </Button>
                  <Button
                    onClick={() => setViewMode(EInboxViewMode.applications)}
                    fontWeight={viewMode === EInboxViewMode.applications ? "bold" : "normal"}
                    borderColor={viewMode === EInboxViewMode.applications ? "theme.blueActive" : "border.light"}
                    leftIcon={<RadioDot active={viewMode === EInboxViewMode.applications} />}
                    rightIcon={<Icon as={ListBullets} />}
                  >
                    {t("submissionInbox.applications")}
                  </Button>
                </ButtonGroup>

                <ButtonGroup isAttached variant="outline" size="sm">
                  <Button
                    onClick={() => setDisplayMode(EInboxDisplayMode.list)}
                    fontWeight={displayMode === EInboxDisplayMode.list ? "bold" : "normal"}
                    borderColor={displayMode === EInboxDisplayMode.list ? "theme.blueActive" : "border.light"}
                    leftIcon={<RadioDot active={displayMode === EInboxDisplayMode.list} />}
                    rightIcon={<Icon as={List} />}
                  >
                    {t("submissionInbox.list")}
                  </Button>
                  <Button
                    onClick={() => setDisplayMode(EInboxDisplayMode.columns)}
                    fontWeight={displayMode === EInboxDisplayMode.columns ? "bold" : "normal"}
                    borderColor={displayMode === EInboxDisplayMode.columns ? "theme.blueActive" : "border.light"}
                    leftIcon={<RadioDot active={displayMode === EInboxDisplayMode.columns} />}
                    rightIcon={<Icon as={Columns} />}
                  >
                    {t("submissionInbox.columns")}
                  </Button>
                </ButtonGroup>
              </HStack>
            </HStack>

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
              <DaysInQueueFilter
                value={activeSearchStore.daysInQueueFilter}
                onChange={(val) => activeSearchStore.setDaysInQueueFilter(val)}
                onApply={() => activeSearchStore.search()}
                onClear={() => {
                  activeSearchStore.setDaysInQueueFilter(null)
                  activeSearchStore.search()
                }}
              />
              {viewMode === EInboxViewMode.projects && (
                <AssignedFilter
                  value={[...activeSearchStore.assignedFilter]}
                  onChange={(val) => activeSearchStore.setAssignedFilter(val)}
                  onApply={() => activeSearchStore.search()}
                  onClear={() => {
                    activeSearchStore.setAssignedFilter([])
                    activeSearchStore.search()
                  }}
                />
              )}
              <Button variant="link" size="sm" onClick={() => activeSearchStore.resetFilters()}>
                {t("submissionInbox.clearAllFilters")}
              </Button>
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
            onShowMore={handleShowMore}
          />
        </Flex>
      </Flex>
    </Flex>
  )
})

function RadioDot({ active }: { active: boolean }) {
  return (
    <Circle
      size="16px"
      border="4px solid"
      borderColor={active ? "theme.blueActive" : "gray.300"}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {!active && <Circle size="8px" bg="white" />}
    </Circle>
  )
}

const InboxContent = observer(function InboxContent({
  viewMode,
  displayMode,
  permitProjectSearch,
  permitApplicationSearch,
  submissionInboxStore,
  onShowMore,
}: {
  viewMode: EInboxViewMode
  displayMode: EInboxDisplayMode
  permitProjectSearch: any
  permitApplicationSearch: any
  submissionInboxStore: any
  onShowMore?: (columnState: string) => void
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
          columnTotals={permitProjectSearch.columnTotals}
          collapsedColumns={[...submissionInboxStore.collapsedColumns]}
          onToggleColumn={(state) => submissionInboxStore.toggleColumnCollapsed(state)}
          onShowMore={onShowMore}
          onReorder={(event) => permitProjectSearch.reorderProjects(event.orderedIds)}
        />
      )
    }
    return (
      <ApplicationKanbanBoard
        applications={permitApplicationSearch.tablePermitApplications}
        stateCounts={permitApplicationSearch.stateCounts}
        columnTotals={permitApplicationSearch.columnTotals}
        collapsedColumns={[...submissionInboxStore.collapsedColumns]}
        onToggleColumn={(state) => submissionInboxStore.toggleColumnCollapsed(state)}
        onShowMore={onShowMore}
        onReorder={(event) => permitApplicationSearch.reorderApplications(event.orderedIds)}
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
