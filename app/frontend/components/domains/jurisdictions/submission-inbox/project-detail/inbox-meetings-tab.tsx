import { Box, Flex, Heading, HStack } from "@chakra-ui/react"
import { CalendarBlank } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMatch, useParams } from "react-router-dom"
import { useSearch } from "../../../../../hooks/use-search"
import { IPermitProject } from "../../../../../models/permit-project"
import { IProjectMeeting } from "../../../../../models/project-meeting"
import { useMst } from "../../../../../setup/root"
import { ProjectMeetingInboxTable } from "../project-meeting-inbox-table"
import { ReviewerMeetingDetailContent } from "../reviewer-meeting-detail-content"

interface IProps {
  permitProject: IPermitProject
}

export const InboxMeetingsTab = observer(({ permitProject }: IProps) => {
  const { t } = useTranslation()
  const { jurisdictionId } = useParams<{ jurisdictionId: string }>()
  const projectMeetingDetailMatch = useMatch(
    "/jurisdictions/:jurisdictionId/submission-inbox/projects/:permitProjectId/meetings/:meetingId"
  )
  const { projectMeetingStore } = useMst()

  useSearch(projectMeetingStore, projectMeetingDetailMatch ? [null] : [permitProject.id, "reviewer-project-meetings"])

  if (projectMeetingDetailMatch?.params.meetingId && jurisdictionId) {
    return (
      <Flex direction="column" flex={1} minW={0} h="full" overflow="auto" bg="greys.white" p={10}>
        <Box w="full" maxW="container.lg">
          <ReviewerMeetingDetailContent jurisdictionId={jurisdictionId} permitProject={permitProject} />
        </Box>
      </Flex>
    )
  }

  const getRowPath = (projectMeeting: IProjectMeeting) =>
    `/jurisdictions/${jurisdictionId}/submission-inbox/projects/${permitProject.id}/meetings/${projectMeeting.id}`

  return (
    <Flex direction="column" flex={1} minW={0} h="full" overflow="hidden" bg="greys.white" p={10}>
      <Box as="section" flex={1} minH={0} display="flex" flexDirection="column">
        <HStack align="center" spacing={4} mb={6}>
          <CalendarBlank size={32} />
          <Heading as="h2" size="lg" mb={0}>
            {t("submissionInbox.projectDetail.meetings")}
          </Heading>
        </HStack>
        <ProjectMeetingInboxTable
          searchStore={projectMeetingStore}
          projectMeetings={projectMeetingStore.tableProjectMeetings}
          getSortColumnHeader={projectMeetingStore.getProjectMeetingSortColumnHeader}
          getRowPath={getRowPath}
          noResultsDescription={t("permitProject.meetings.empty")}
          hideProjectNumber
        />
      </Box>
    </Flex>
  )
})
