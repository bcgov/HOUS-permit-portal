import { Box, Button, ButtonGroup, Circle, Flex, Heading, HStack, Icon, Link, Text, VStack } from "@chakra-ui/react"
import { Buildings, Columns, FileText, ListDashes, MagnifyingGlass, Tray } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useCallback, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { Link as RouterLink, useParams } from "react-router-dom"
import { useJurisdiction } from "../../../../hooks/resources/use-jurisdiction"
import { usePopStateModeSync } from "../../../../hooks/use-popstate-mode-sync"
import { useSearch } from "../../../../hooks/use-search"
import { useMst } from "../../../../setup/root"
import { EInboxDisplayMode, EInboxViewMode, EPermitApplicationStatus } from "../../../../types/enums"
import { IOption } from "../../../../types/types"
import { CalloutBanner } from "../../../shared/base/callout-banner"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { ApplicationInboxTable } from "./application-inbox-table"
import { ApplicationKanbanBoard } from "./application-kanban-board"
import {
  AssignedFilter,
  DaysInQueueFilter,
  ProjectStateFilter,
  RequirementTemplateInboxFilter,
  StatusFilter,
  UnreadFilter,
} from "./filters"
import { InboxNoMatchingEmpty } from "./inbox-no-matching-empty"
import { ProjectInboxTable } from "./project-inbox-table"
import { ProjectKanbanBoard } from "./project-kanban-board"

const LIST_DEFAULT_PER_PAGE = 10

export const JurisdictionSubmissionInboxScreen = observer(function JurisdictionSubmissionInbox() {
  const { t } = useTranslation()
  const { jurisdictionId } = useParams()
  const { submissionInboxStore, sandboxStore, collaboratorStore } = useMst()
  const { currentJurisdiction, error } = useJurisdiction()

  const { viewMode, displayMode, setViewMode, setDisplayMode, permitProjectSearch, permitApplicationSearch } =
    submissionInboxStore
  const { currentSandboxId } = sandboxStore

  const activeSearchStore = viewMode === EInboxViewMode.projects ? permitProjectSearch : permitApplicationSearch
  const prevDisplayModeRef = useRef(displayMode)
  const prevViewModeRef = useRef(viewMode)
  const inboxSearchEnabled = currentJurisdiction?.submissionInboxSetUp === true

  usePopStateModeSync(submissionInboxStore)

  useEffect(() => {
    const switchedToColumns =
      displayMode === EInboxDisplayMode.columns && prevDisplayModeRef.current !== EInboxDisplayMode.columns
    const switchedToList =
      displayMode === EInboxDisplayMode.list && prevDisplayModeRef.current !== EInboxDisplayMode.list

    if (inboxSearchEnabled) {
      if (switchedToColumns) {
        if (viewMode === EInboxViewMode.projects) {
          permitProjectSearch.setStateFilter([])
        } else {
          permitApplicationSearch.setStatusFilter([] as EPermitApplicationStatus[])
        }
        activeSearchStore.search()
      } else if (switchedToList) {
        activeSearchStore.setCountPerPage(LIST_DEFAULT_PER_PAGE)
        activeSearchStore.search({ countPerPage: LIST_DEFAULT_PER_PAGE })
      }
    }

    prevDisplayModeRef.current = displayMode
  }, [displayMode, inboxSearchEnabled, activeSearchStore])

  useEffect(() => {
    if (!inboxSearchEnabled) {
      prevViewModeRef.current = viewMode
      return
    }
    if (viewMode !== prevViewModeRef.current && displayMode === EInboxDisplayMode.columns) {
      if (viewMode === EInboxViewMode.projects) {
        permitProjectSearch.setStateFilter([])
      } else {
        permitApplicationSearch.setStatusFilter([] as EPermitApplicationStatus[])
      }
    }
    prevViewModeRef.current = viewMode
  }, [viewMode, displayMode, inboxSearchEnabled, permitProjectSearch, permitApplicationSearch])

  useSearch(
    activeSearchStore,
    inboxSearchEnabled ? [currentJurisdiction?.id, JSON.stringify(currentSandboxId), viewMode] : [null, null, null]
  )

  const loadCollaboratorOptions = useCallback(async (): Promise<IOption[]> => {
    if (!currentJurisdiction?.id) return []
    return collaboratorStore.fetchCollaboratorOptionsForJurisdiction(currentJurisdiction.id)
  }, [currentJurisdiction?.id])

  if (error) return <ErrorScreen error={error} />
  if (!currentJurisdiction) return <LoadingScreen />

  const submissionInboxConfigured = currentJurisdiction.submissionInboxSetUp === true

  const handleShowMore = (columnState: string) => {
    setDisplayMode(EInboxDisplayMode.list)
    if (viewMode === EInboxViewMode.projects) {
      permitProjectSearch.setStateFilter([columnState])
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
        py={4}
        overflowY="auto"
      >
        <Text fontSize="xs" fontWeight="bold" color="text.secondary" mb={4} px={4} textTransform="uppercase">
          {t("submissionInbox.workspace")}
        </Text>
        <VStack align="stretch" spacing={1}>
          <Button
            w="full"
            variant="ghost"
            justifyContent="flex-start"
            leftIcon={<Tray />}
            bg="background.blueLight"
            fontWeight="bold"
            size="sm"
            borderRadius={0}
            px={4}
            _hover={{ shadow: "sm", bg: "gray.50" }}
            _active={{ bg: "background.blueLight" }}
          >
            {t("submissionInbox.submissions")}
          </Button>
          {/* ### SUBMISSION INDEX STUB FEATURE */}
          {/* <Button
            variant="ghost"
            justifyContent="flex-start"
            leftIcon={<CalendarBlank />}
            size="sm"
            color="text.secondary"
          >
            {t("submissionInbox.meetings")}
          </Button> */}
        </VStack>
      </Box>

      {/* Main content */}
      <Flex direction="column" flex={1} minW={0} h="full" overflow="hidden">
        {/* Pinned header: title, search, filters, toggles */}
        <Box flexShrink={0} px={8} pt={8} pb={4}>
          <VStack align="start" spacing={5} w="full">
            {submissionInboxConfigured && !currentJurisdiction.inboxEnabled && (
              <CalloutBanner type="error" title={t("permitApplication.submissionInbox.contactInviteWarning")} />
            )}

            <Heading as="h1">{t("permitApplication.submissionInbox.title")}</Heading>

            {!submissionInboxConfigured && (
              <>
                <CalloutBanner
                  type="info"
                  title={t("submissionInbox.setupEmailNotificationsTitle")}
                  body={t("submissionInbox.setupEmailNotificationsBody")}
                />
                {jurisdictionId && (
                  <Link
                    as={RouterLink}
                    fontSize="sm"
                    color="text.link"
                    to={`/jurisdictions/${jurisdictionId}/configuration-management/feature-access/submissions-inbox-setup`}
                  >
                    {t("submissionInbox.setupEmailNotificationsLink")}
                  </Link>
                )}
              </>
            )}

            {/* Search (full width) + toolbar row (toggles | filters | clear) + result count */}
            {submissionInboxConfigured && (
              <VStack align="stretch" spacing={4} w="full">
                <Flex
                  w="full"
                  align="center"
                  gap={2}
                  border="1px solid"
                  borderColor="border.light"
                  borderRadius="md"
                  bg="white"
                  px={3}
                >
                  <MagnifyingGlass size={18} weight="bold" color="var(--chakra-colors-gray-500)" aria-hidden />
                  <Box
                    as="input"
                    flex={1}
                    minW={0}
                    py={2}
                    border="none"
                    outline="none"
                    fontSize="sm"
                    placeholder={t("submissionInbox.searchPlaceholder")}
                    _placeholder={{ color: "text.secondary" }}
                    value={activeSearchStore.query ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      activeSearchStore.setQuery(e.target.value)
                      activeSearchStore.search()
                    }}
                  />
                </Flex>

                <Flex w="full" flexWrap="wrap" alignItems="center" columnGap={3} rowGap={3}>
                  <HStack spacing={3} flexShrink={0} flexWrap="wrap">
                    <ButtonGroup isAttached variant="outline" size="sm">
                      <Button
                        borderRightWidth={2}
                        onClick={() => setViewMode(EInboxViewMode.projects)}
                        fontWeight={viewMode === EInboxViewMode.projects ? "bold" : "normal"}
                        borderColor={viewMode === EInboxViewMode.projects ? "theme.blueActive" : "border.light"}
                        bg={viewMode === EInboxViewMode.projects ? "background.blueLight" : undefined}
                        leftIcon={<RadioDot active={viewMode === EInboxViewMode.projects} />}
                        rightIcon={<Icon as={Buildings} />}
                      >
                        {t("submissionInbox.projects")}
                      </Button>
                      <Button
                        onClick={() => setViewMode(EInboxViewMode.applications)}
                        fontWeight={viewMode === EInboxViewMode.applications ? "bold" : "normal"}
                        borderColor={viewMode === EInboxViewMode.applications ? "theme.blueActive" : "border.light"}
                        bg={viewMode === EInboxViewMode.applications ? "background.blueLight" : undefined}
                        leftIcon={<RadioDot active={viewMode === EInboxViewMode.applications} />}
                        rightIcon={<Icon as={FileText} />}
                      >
                        {t("submissionInbox.applications")}
                      </Button>
                    </ButtonGroup>

                    <ButtonGroup isAttached variant="outline" size="sm">
                      <Button
                        borderRightWidth={2}
                        onClick={() => setDisplayMode(EInboxDisplayMode.list)}
                        fontWeight={displayMode === EInboxDisplayMode.list ? "bold" : "normal"}
                        borderColor={displayMode === EInboxDisplayMode.list ? "theme.blueActive" : "border.light"}
                        bg={displayMode === EInboxDisplayMode.list ? "background.blueLight" : undefined}
                        leftIcon={<RadioDot active={displayMode === EInboxDisplayMode.list} />}
                        rightIcon={<Icon as={ListDashes} />}
                      >
                        {t("submissionInbox.list")}
                      </Button>
                      <Button
                        onClick={() => setDisplayMode(EInboxDisplayMode.columns)}
                        fontWeight={displayMode === EInboxDisplayMode.columns ? "bold" : "normal"}
                        borderColor={displayMode === EInboxDisplayMode.columns ? "theme.blueActive" : "border.light"}
                        bg={displayMode === EInboxDisplayMode.columns ? "background.blueLight" : undefined}
                        leftIcon={<RadioDot active={displayMode === EInboxDisplayMode.columns} />}
                        rightIcon={<Icon as={Columns} />}
                      >
                        {t("submissionInbox.columns")}
                      </Button>
                    </ButtonGroup>
                  </HStack>

                  <Flex flex="1" minW={0} flexWrap="wrap" gap={2} justifyContent="flex-start" alignItems="center">
                    <UnreadFilter
                      value={activeSearchStore.unreadFilter}
                      onChange={(val) => activeSearchStore.setUnreadFilter(val)}
                      onApply={() => activeSearchStore.search()}
                      badgeCount={
                        viewMode === EInboxViewMode.projects
                          ? permitProjectSearch.tablePermitProjects.filter((p) => !p.viewedAt).length
                          : permitApplicationSearch.tablePermitApplications.filter((a) => !a.isViewed).length
                      }
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
                    {displayMode === EInboxDisplayMode.list && viewMode === EInboxViewMode.applications && (
                      <StatusFilter
                        value={[...permitApplicationSearch.statusFilter]}
                        onChange={(val) => permitApplicationSearch.setStatusFilter(val as EPermitApplicationStatus[])}
                        onApply={() => permitApplicationSearch.search()}
                        onClear={() => {
                          permitApplicationSearch.setStatusFilter([] as EPermitApplicationStatus[])
                          permitApplicationSearch.search()
                        }}
                      />
                    )}
                    {displayMode === EInboxDisplayMode.list && viewMode === EInboxViewMode.projects && (
                      <ProjectStateFilter
                        value={[...permitProjectSearch.stateFilter]}
                        onChange={(val) => permitProjectSearch.setStateFilter(val as string[])}
                        onApply={() => permitProjectSearch.search()}
                        onClear={() => {
                          permitProjectSearch.setStateFilter([])
                          permitProjectSearch.search()
                        }}
                      />
                    )}
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
                      loadOptions={loadCollaboratorOptions}
                    />
                  </Flex>

                  <Button
                    variant="link"
                    size="sm"
                    flexShrink={0}
                    ml={{ base: 0, lg: "auto" }}
                    onClick={() => activeSearchStore.resetFilters()}
                  >
                    {t("submissionInbox.clearAllFilters")}
                  </Button>
                </Flex>

                <TotalCountLabel viewMode={viewMode} displayMode={displayMode} activeSearchStore={activeSearchStore} />
              </VStack>
            )}
          </VStack>
        </Box>

        {/* Content area — columns mode fills exactly; list mode scrolls */}
        {submissionInboxConfigured && (
          <Flex
            direction="column"
            flex={1}
            minH={0}
            minW={0}
            overflowX="auto"
            overflowY="hidden"
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
        )}
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

const TotalCountLabel = observer(function TotalCountLabel({
  viewMode,
  displayMode,
  activeSearchStore,
}: {
  viewMode: EInboxViewMode
  displayMode: EInboxDisplayMode
  activeSearchStore: any
}) {
  const { t } = useTranslation()

  const unfilteredTotal: number = activeSearchStore.stateCounts
    ? Object.values(activeSearchStore.stateCounts as Record<string, number>).reduce(
        (sum: number, n: number) => sum + n,
        0
      )
    : 0

  let filteredCount: number
  if (displayMode === EInboxDisplayMode.columns && activeSearchStore.columnTotals) {
    filteredCount = Object.values(activeSearchStore.columnTotals as Record<string, number>).reduce(
      (sum: number, n: number) => sum + n,
      0
    )
  } else {
    filteredCount = activeSearchStore.totalCount ?? unfilteredTotal
  }

  if (unfilteredTotal === 0) return null

  // @ts-ignore
  const label: string =
    viewMode === EInboxViewMode.projects ? t("submissionInbox.projects") : t("submissionInbox.applications")

  return (
    <Text fontSize="sm" color="text.secondary" mb={0} flexShrink={0}>
      {filteredCount < unfilteredTotal
        ? // @ts-ignore
          t("submissionInbox.projectDetail.showingResultSummaryFiltered", {
            filtered: filteredCount,
            total: unfilteredTotal,
            label: label.toLowerCase(),
          })
        : // @ts-ignore
          t("submissionInbox.projectDetail.showingResultSummary", {
            count: unfilteredTotal,
            label: label.toLowerCase(),
          })}
    </Text>
  )
})

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

    if (submissionInboxStore.inboxShowsNoResultsKanban) {
      return (
        <Flex w="full" justify="flex-start" align="flex-start" minH="200px">
          <InboxNoMatchingEmpty viewMode={viewMode} onClearFilters={() => activeSearch.resetFilters()} />
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
    return (
      <Flex flex={1} minH={0} minW={0} direction="column" w="full">
        <ProjectInboxTable searchStore={permitProjectSearch} projects={permitProjectSearch.tablePermitProjects} />
      </Flex>
    )
  }

  return (
    <Flex flex={1} minH={0} minW={0} direction="column" w="full">
      <ApplicationInboxTable
        searchStore={permitApplicationSearch}
        applications={permitApplicationSearch.tablePermitApplications}
      />
    </Flex>
  )
})
