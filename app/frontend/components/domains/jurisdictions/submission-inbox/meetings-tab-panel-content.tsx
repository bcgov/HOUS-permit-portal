import { Box, Button, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useSearch } from "../../../../hooks/use-search"
import { IJurisdiction } from "../../../../models/jurisdiction"
import { useMst } from "../../../../setup/root"
import { EProjectMeetingStatus } from "../../../../types/enums"
import { CalloutBanner } from "../../../shared/base/callout-banner"
import { ProjectMeetingStatusFilter, UnreadFilter } from "./filters"
import { ProjectMeetingInboxTable } from "./project-meeting-inbox-table"
import { SearchInput } from "./submissions-tab-panel-content"

interface IProps {
  currentJurisdiction: IJurisdiction
}

export const MeetingsTabPanelContent = observer(function MeetingsTabPanelContent({ currentJurisdiction }: IProps) {
  const { t } = useTranslation()
  const { projectMeetingInboxStore, sandboxStore, siteConfigurationStore } = useMst()
  const { currentSandboxId } = sandboxStore
  const projectMeetingsEnabled = Boolean(
    siteConfigurationStore.projectMeetingsEnabled && currentJurisdiction.projectMeetingsEnabled
  )
  const jurisdictionUnreadCount = currentJurisdiction.unviewedProjectMeetingsCount ?? 0

  useSearch(
    projectMeetingInboxStore,
    projectMeetingsEnabled ? [currentJurisdiction.id, JSON.stringify(currentSandboxId), "meetings"] : [null]
  )

  return (
    <Flex direction="column" flex={1} minW={0} h="full" overflow="hidden">
      <Box flexShrink={0} px={8} pt={8} pb={4}>
        <VStack align="start" spacing={5} w="full">
          <Heading as="h1">{t("submissionInbox.meetings")}</Heading>

          {!projectMeetingsEnabled && (
            <CalloutBanner type="info" title={t("submissionInbox.meetingsUnavailableTitle")} />
          )}

          {projectMeetingsEnabled && (
            <VStack align="stretch" spacing={4} w="full">
              <SearchInput
                placeholder={t("submissionInbox.meetingSearchPlaceholder")}
                value={projectMeetingInboxStore.query ?? ""}
                onChange={(value) => {
                  projectMeetingInboxStore.setQuery(value)
                  projectMeetingInboxStore.search()
                }}
              />

              <Flex w="full" flexWrap="wrap" alignItems="center" gap={3}>
                <UnreadFilter
                  value={projectMeetingInboxStore.unreadFilter}
                  onChange={(val) => projectMeetingInboxStore.setUnreadFilter(val)}
                  onApply={() => projectMeetingInboxStore.search()}
                  badgeCount={jurisdictionUnreadCount}
                />
                <ProjectMeetingStatusFilter
                  value={[...projectMeetingInboxStore.statusFilter]}
                  onChange={(val) => projectMeetingInboxStore.setStatusFilter(val as EProjectMeetingStatus[])}
                  onApply={() => projectMeetingInboxStore.search()}
                  onClear={() => {
                    projectMeetingInboxStore.setStatusFilter([] as EProjectMeetingStatus[])
                    projectMeetingInboxStore.search()
                  }}
                />
                <Button
                  variant="link"
                  size="sm"
                  flexShrink={0}
                  ml="auto"
                  onClick={() => projectMeetingInboxStore.resetFilters()}
                >
                  {t("submissionInbox.clearAllFilters")}
                </Button>
              </Flex>

              <MeetingTotalCountLabel searchStore={projectMeetingInboxStore} />
            </VStack>
          )}
        </VStack>
      </Box>

      {projectMeetingsEnabled && (
        <Flex direction="column" flex={1} minH={0} minW={0} overflowX="auto" overflowY="hidden" px={8} pb={8}>
          <Flex flex={1} minH={0} minW={0} direction="column" w="full">
            <ProjectMeetingInboxTable
              searchStore={projectMeetingInboxStore}
              projectMeetings={projectMeetingInboxStore.tableProjectMeetings}
            />
          </Flex>
        </Flex>
      )}
    </Flex>
  )
})

const MeetingTotalCountLabel = observer(function MeetingTotalCountLabel({ searchStore }: { searchStore: any }) {
  const { t } = useTranslation()
  const label = "meetings"

  const unfilteredTotal: number = searchStore.statusCounts
    ? Object.values(searchStore.statusCounts as Record<string, number>).reduce((sum: number, n: number) => sum + n, 0)
    : 0

  const filteredCount = searchStore.totalCount ?? unfilteredTotal

  if (unfilteredTotal === 0) return null

  return (
    <Text fontSize="sm" color="text.secondary" mb={0} flexShrink={0}>
      {filteredCount < unfilteredTotal
        ? t("submissionInbox.projectDetail.showingResultSummaryFiltered", {
            filtered: filteredCount,
            total: unfilteredTotal,
            label,
          })
        : t("submissionInbox.projectDetail.showingResultSummary", {
            count: unfilteredTotal,
            label,
          })}
    </Text>
  )
})
