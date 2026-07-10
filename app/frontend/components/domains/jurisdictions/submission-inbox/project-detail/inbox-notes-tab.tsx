import { Box, Button, Heading, HStack, Text } from "@chakra-ui/react"
import { Chat, Download } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { IPermitProject } from "../../../../../models/permit-project"
import { ProjectMeetingNotesList } from "../../../../shared/project-meetings/project-meeting-notes-list"

interface IProps {
  permitProject: IPermitProject
}

export const InboxNotesTab = observer(({ permitProject }: IProps) => {
  const { t } = useTranslation()
  const { jurisdictionId } = useParams<{ jurisdictionId: string }>()

  return (
    <FlexColumn>
      <Box as="section">
        <HStack align="center" spacing={4} mb={6}>
          <Chat size={32} />
          <Heading as="h2" size="lg" mb={0}>
            {t("submissionInbox.projectDetail.notes")}
          </Heading>
        </HStack>

        <Box bg="background.blueLight" borderRadius="lg" p={8} mb={6}>
          <Heading as="h3" size="md" mb={4}>
            {t("submissionInbox.projectDetail.notesInfoTitle")}
          </Heading>
          <Text mb={permitProject.notes.length > 0 ? 5 : 0}>
            {t("submissionInbox.projectDetail.notesInfoDescription")}
          </Text>
          {permitProject.notes.length > 0 && (
            <Button
              variant="secondary"
              leftIcon={<Download size={16} />}
              onClick={() => permitProject.downloadNotesCsv()}
            >
              {t("projectMeeting.detail.notes.downloadAll")}
            </Button>
          )}
        </Box>

        <Heading as="h3" size="md" mb={4}>
          {t("submissionInbox.projectDetail.projectMeetingNotes")}
        </Heading>

        <ProjectMeetingNotesList
          notes={permitProject.notes}
          emptyDescription={t("submissionInbox.projectDetail.notesEmptyDescription")}
          getMeetingPath={(note) =>
            `/jurisdictions/${jurisdictionId}/submission-inbox/projects/${permitProject.id}/meetings/${note.projectMeetingId}`
          }
        />
      </Box>
    </FlexColumn>
  )
})

const FlexColumn = ({ children }: { children: React.ReactNode }) => (
  <Box flex={1} minH={0} minW={0} overflowY="auto" bg="greys.white" p={10}>
    {children}
  </Box>
)
