import { Box, Button, ButtonGroup, Container, Flex, Heading, HStack, Icon, Text, VStack } from "@chakra-ui/react"
import { CalendarBlank, Columns, List, ListBullets, Stack } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useJurisdiction } from "../../../../hooks/resources/use-jurisdiction"
import { usePermitClassificationsLoad } from "../../../../hooks/resources/use-permit-classifications-load"
import { useSearch } from "../../../../hooks/use-search"
import { useMst } from "../../../../setup/root"
import { CalloutBanner } from "../../../shared/base/callout-banner"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import {
  AssignedFilter,
  DaysInQueueFilter,
  MeetingRequestsFilter,
  PermitTypeFilter,
  ProjectStatusFilter,
  StatusFilter,
  UnreadFilter,
} from "./filters"
import { ProjectInboxTable } from "./project-inbox-table"

export const JurisdictionSubmissionInboxScreen = observer(function JurisdictionSubmissionInbox() {
  const { t } = useTranslation()
  const { submissionInboxStore, sandboxStore } = useMst()
  const { currentJurisdiction, error } = useJurisdiction()
  const { isLoaded: isPermitClassificationsLoaded } = usePermitClassificationsLoad()

  const { viewMode, displayMode, setViewMode, setDisplayMode, permitProjectSearch, permitApplicationSearch } =
    submissionInboxStore
  const { currentSandboxId } = sandboxStore

  const activeSearchStore = viewMode === "projects" ? permitProjectSearch : permitApplicationSearch

  useSearch(activeSearchStore, [currentJurisdiction?.id, JSON.stringify(currentSandboxId), viewMode])

  if (error) return <ErrorScreen error={error} />
  if (!currentJurisdiction || !isPermitClassificationsLoaded) return <LoadingScreen />

  return (
    <Flex as="main" minH="100vh">
      {/* Sidebar */}
      <Box w="200px" minW="200px" bg="greys.grey10" borderRight="1px solid" borderColor="border.light" p={4}>
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
      <Container maxW="container.xl" p={8} flex={1}>
        <VStack align="start" spacing={5} w="full" h="full">
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
            <MeetingRequestsFilter
              value={activeSearchStore.meetingRequestFilter}
              onChange={(val) => activeSearchStore.setMeetingRequestFilter(val)}
              onApply={() => activeSearchStore.search()}
              // badgeCount={4}
            />
            <UnreadFilter
              value={activeSearchStore.unreadFilter}
              onChange={(val) => activeSearchStore.setUnreadFilter(val)}
              onApply={() => activeSearchStore.search()}
              // badgeCount={2}
            />
            <PermitTypeFilter
              value={[...activeSearchStore.permitTypeFilter]}
              onChange={(val) => activeSearchStore.setPermitTypeFilter(val)}
              onApply={() => activeSearchStore.search()}
              onClear={() => {
                activeSearchStore.setPermitTypeFilter([])
                activeSearchStore.search()
              }}
            />
            {viewMode === "projects" ? (
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
            <DaysInQueueFilter
              value={[...activeSearchStore.daysInQueueFilter]}
              onChange={(val) => activeSearchStore.setDaysInQueueFilter(val)}
              onApply={() => activeSearchStore.search()}
              onClear={() => {
                activeSearchStore.setDaysInQueueFilter([])
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
            <Button variant="link" size="sm" onClick={() => activeSearchStore.resetFilters()}>
              {t("submissionInbox.clearAllFilters")}
            </Button>
          </HStack>

          {/* View toggles */}
          <HStack spacing={4}>
            <ButtonGroup isAttached variant="outline" size="sm">
              <Button
                onClick={() => setViewMode("projects")}
                bg={viewMode === "projects" ? "white" : undefined}
                fontWeight={viewMode === "projects" ? "bold" : "normal"}
                borderColor="border.light"
                leftIcon={<Icon as={Stack} />}
              >
                {t("submissionInbox.projects")}
              </Button>
              <Button
                onClick={() => setViewMode("applications")}
                bg={viewMode === "applications" ? "white" : undefined}
                fontWeight={viewMode === "applications" ? "bold" : "normal"}
                borderColor="border.light"
                leftIcon={<Icon as={ListBullets} />}
              >
                {t("submissionInbox.applications")}
              </Button>
            </ButtonGroup>

            <ButtonGroup isAttached variant="outline" size="sm">
              <Button
                onClick={() => setDisplayMode("list")}
                bg={displayMode === "list" ? "white" : undefined}
                fontWeight={displayMode === "list" ? "bold" : "normal"}
                borderColor="border.light"
                leftIcon={<Icon as={List} />}
              >
                {t("submissionInbox.list")}
              </Button>
              <Button
                onClick={() => setDisplayMode("columns")}
                bg={displayMode === "columns" ? "white" : undefined}
                fontWeight={displayMode === "columns" ? "bold" : "normal"}
                borderColor="border.light"
                leftIcon={<Icon as={Columns} />}
              >
                {t("submissionInbox.columns")}
              </Button>
            </ButtonGroup>
          </HStack>

          {/* Content */}
          {displayMode === "columns" ? (
            // ### SUBMISSION INDEX STUB FEATURE
            <Box w="full" p={8} textAlign="center">
              <Text color="text.secondary">{t("submissionInbox.columnsViewComingSoon")}</Text>
            </Box>
          ) : viewMode === "projects" ? (
            <ProjectInboxTable searchStore={permitProjectSearch} projects={permitProjectSearch.tablePermitProjects} />
          ) : (
            // Applications list view - placeholder until Applications table is built
            <Box w="full" p={8} textAlign="center">
              <Text color="text.secondary">{t("submissionInbox.applicationsViewComingSoon")}</Text>
            </Box>
          )}
        </VStack>
      </Container>
    </Flex>
  )
})
