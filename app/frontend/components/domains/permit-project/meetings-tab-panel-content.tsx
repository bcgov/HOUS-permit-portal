import { Box, Flex, Heading, HStack, Text } from "@chakra-ui/react"
import { CalendarBlank, CaretRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMatch } from "react-router-dom"
import { useSearch } from "../../../hooks/use-search"
import { IPermitProject } from "../../../models/permit-project"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus } from "../../../types/enums"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { ErrorScreen } from "../../shared/base/error-screen"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
import { SearchGrid } from "../../shared/grid/search-grid"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { ActiveProjectMeetingNotice } from "../../shared/project-meetings/active-project-meeting-notice"
import { ProjectMeetingDetailContent } from "../project-meeting/project-meeting-detail-screen"
import { ProjectMeetingGridHeaders } from "./project-meeting-grid-headers"
import { ProjectMeetingGridRow } from "./project-meeting-grid-row"

interface IProps {
  permitProject: IPermitProject
}

export const MeetingsTabPanelContent = observer(({ permitProject }: IProps) => {
  const { t } = useTranslation()
  const { siteConfigurationStore } = useMst()
  const projectMeetingDetailMatch = useMatch("/projects/:permitProjectId/meetings/:projectMeetingId")
  const projectMeetingsEnabled = Boolean(
    siteConfigurationStore.projectMeetingsEnabled && permitProject.jurisdiction?.projectMeetingsEnabled
  )

  if (projectMeetingDetailMatch?.params.projectMeetingId) {
    if (!projectMeetingsEnabled) {
      return (
        <Flex direction="column" flex={1} bg="greys.white" p={10}>
          <ErrorScreen error={new Error(t("projectMeeting.validation.featureUnavailable"))} />
        </Flex>
      )
    }

    return (
      <Flex direction="column" flex={1} bg="greys.white" p={10}>
        <ProjectMeetingDetailContent permitProject={permitProject} />
      </Flex>
    )
  }

  return <MeetingsListContent permitProject={permitProject} projectMeetingsEnabled={projectMeetingsEnabled} />
})

interface MeetingsListContentProps extends IProps {
  projectMeetingsEnabled: boolean
}

const MeetingsListContent = observer(({ permitProject, projectMeetingsEnabled }: MeetingsListContentProps) => {
  const { t } = useTranslation()
  const { projectMeetingStore } = useMst()
  const {
    countPerPage,
    currentPage,
    handleCountPerPageChange,
    handlePageChange,
    isSearching,
    tableProjectMeetings,
    totalCount,
    totalPages,
  } = projectMeetingStore
  const hasActiveProjectMeeting = !!permitProject.activeProjectMeeting
  const canRequestProjectMeeting = permitProject.isOwner && projectMeetingsEnabled && !hasActiveProjectMeeting

  useSearch(projectMeetingStore, [permitProject.id])

  return (
    <Flex direction="column" flex={1} bg="greys.white" p={10}>
      <Box as="section">
        <Flex justify="space-between" align="center" mb={6}>
          <HStack align="center" spacing={4}>
            <CalendarBlank size={32} />
            <Heading as="h2" size="lg" mb={0}>
              {t("permitProject.meetings.tabTitle")}
            </Heading>
          </HStack>
        </Flex>
        {hasActiveProjectMeeting ? (
          <ActiveProjectMeetingNotice permitProject={permitProject} />
        ) : (
          canRequestProjectMeeting && (
            <Box bg="theme.blueLight" borderRadius="md" p={6} mb={8}>
              <Heading as="h3" size="sm" mb={3}>
                {t("permitProject.meetings.requestCalloutTitle")}
              </Heading>
              <Text mb={4}>{t("permitProject.meetings.requestCalloutDescription")}</Text>
              <RouterLinkButton
                to={`/projects/${permitProject.id}/meetings/new`}
                variant="primary"
                rightIcon={<CaretRight size={16} />}
              >
                {t("permitProject.meetings.requestButton")}
              </RouterLinkButton>
            </Box>
          )
        )}
        {!canRequestProjectMeeting && !hasActiveProjectMeeting && (
          <Text color="text.secondary" mb={8}>
            {t("permitProject.meetings.tabDescription")}
          </Text>
        )}
        {!isSearching && tableProjectMeetings.length === 0 ? (
          <CustomMessageBox
            status={EFlashMessageStatus.info}
            description={t("permitProject.meetings.empty")}
            mt={hasActiveProjectMeeting ? 6 : 2}
          />
        ) : (
          <>
            <SearchGrid
              templateColumns="40px minmax(160px, 1fr) minmax(260px, 3fr) minmax(120px, 1fr) minmax(100px, 0.75fr)"
              mt={hasActiveProjectMeeting || canRequestProjectMeeting ? 8 : 0}
            >
              <ProjectMeetingGridHeaders />
              {tableProjectMeetings.map((projectMeeting) => (
                <ProjectMeetingGridRow
                  key={projectMeeting.id}
                  permitProjectId={permitProject.id}
                  projectMeeting={projectMeeting}
                />
              ))}
            </SearchGrid>
            <Flex w="full" justifyContent="space-between" mt={6}>
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
                showLessItems={true}
              />
            </Flex>
          </>
        )}
      </Box>
    </Flex>
  )
})
