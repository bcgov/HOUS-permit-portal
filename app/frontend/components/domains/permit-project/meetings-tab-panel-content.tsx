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
import { SubmitterProjectMeetingDetailContent } from "../project-meeting/project-meeting-detail-screen"
import { ProjectMeetingGridHeaders } from "./project-meeting-grid-headers"
import { ProjectMeetingGridRow } from "./project-meeting-grid-row"

interface IProps {
  permitProject: IPermitProject
}

const ProjectMeetingFeatureUnavailable = () => {
  const { t } = useTranslation()

  return (
    <Flex direction="column" flex={1} bg="greys.white" p={10}>
      <ErrorScreen error={new Error(t("projectMeeting.validation.featureUnavailable"))} />
    </Flex>
  )
}

const useProjectMeetingsEnabled = (permitProject: IPermitProject) => {
  const { siteConfigurationStore } = useMst()

  return Boolean(siteConfigurationStore.projectMeetingsEnabled && permitProject.jurisdiction?.projectMeetingsEnabled)
}

export const MeetingsTabPanelContent = observer(({ permitProject }: IProps) => {
  const projectMeetingDetailMatch = useMatch("/projects/:permitProjectId/meetings/:projectMeetingId")
  const projectMeetingsEnabled = useProjectMeetingsEnabled(permitProject)

  if (projectMeetingDetailMatch?.params.projectMeetingId) {
    if (!projectMeetingsEnabled) return <ProjectMeetingFeatureUnavailable />

    return (
      <Flex direction="column" flex={1} bg="greys.white" p={10}>
        <SubmitterProjectMeetingDetailContent permitProject={permitProject} />
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
  const isEmpty = !isSearching && tableProjectMeetings.length === 0

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
            <CustomMessageBox
              status={EFlashMessageStatus.info}
              title={t("permitProject.meetings.requestCalloutTitle")}
              description={t("permitProject.meetings.requestCalloutDescription")}
              mb={8}
            >
              <RouterLinkButton
                to={`/projects/${permitProject.id}/meetings/new`}
                variant="primary"
                rightIcon={<CaretRight size={16} />}
              >
                {t("permitProject.meetings.requestButton")}
              </RouterLinkButton>
            </CustomMessageBox>
          )
        )}
        {!canRequestProjectMeeting && !hasActiveProjectMeeting && (
          <Text color="text.secondary" mb={8}>
            {t("permitProject.meetings.tabDescription")}
          </Text>
        )}
        <SearchGrid
          templateColumns="minmax(160px, 1fr) minmax(260px, 3fr) minmax(120px, 1fr) minmax(100px, 0.75fr)"
          mt={hasActiveProjectMeeting || canRequestProjectMeeting ? 8 : 2}
          isEmpty={isEmpty}
          emptyDescription={t("permitProject.meetings.empty")}
          emptyIcon={<CalendarBlank size={18} />}
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
        {!isEmpty && (
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
        )}
      </Box>
    </Flex>
  )
})
