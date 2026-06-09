import { Box, Button, Heading, HStack, Text, VStack } from "@chakra-ui/react"
import { ChatText, Clock, Download } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { datefnsTableDateTimeFormat } from "../../../../../constants"
import { INote } from "../../../../../models/note"
import { IPermitProject } from "../../../../../models/permit-project"
import { useMst } from "../../../../../setup/root"
import { SafeTipTapDisplay } from "../../../../shared/editor/safe-tiptap-display"
import { RouterLink } from "../../../../shared/navigation/router-link"

interface IProps {
  permitProject: IPermitProject
}

export const InboxNotesTab = observer(({ permitProject }: IProps) => {
  const { t } = useTranslation()
  const { jurisdictionId } = useParams<{ jurisdictionId: string }>()
  const { projectMeetingStore } = useMst()
  const notes = projectMeetingStore.currentPermitProjectNotes

  useEffect(() => {
    projectMeetingStore.fetchPermitProjectNotes(permitProject.id)
  }, [permitProject.id, projectMeetingStore])

  return (
    <FlexColumn>
      <Box as="section">
        <HStack align="center" spacing={4} mb={6}>
          <ChatText size={32} />
          <Heading as="h2" size="lg" mb={0}>
            {t("submissionInbox.projectDetail.notes")}
          </Heading>
        </HStack>

        <Box bg="background.blueLight" borderRadius="lg" p={8} mb={6}>
          <Heading as="h3" size="md" mb={4}>
            {t("submissionInbox.projectDetail.notesInfoTitle")}
          </Heading>
          <Text mb={5}>{t("submissionInbox.projectDetail.notesInfoDescription")}</Text>
          <Button
            variant="secondary"
            leftIcon={<Download size={16} />}
            onClick={() => projectMeetingStore.downloadPermitProjectNotesCsv(permitProject.id)}
          >
            {t("projectMeeting.detail.notes.downloadAll")}
          </Button>
        </Box>

        <Heading as="h3" size="md" mb={4}>
          {t("submissionInbox.projectDetail.projectMeetingNotes")}
        </Heading>

        {notes.length === 0 ? (
          <Box border="1px" borderColor="border.light" borderRadius="md" p={4}>
            <HStack align="start" spacing={2}>
              <Clock size={18} />
              <Box>
                <Text fontWeight="bold" mb={1}>
                  {t("projectMeeting.detail.notes.emptyTitle")}
                </Text>
                <Text fontSize="sm">{t("submissionInbox.projectDetail.notesEmptyDescription")}</Text>
              </Box>
            </HStack>
          </Box>
        ) : (
          <VStack align="stretch" spacing={4}>
            {notes.map((note) => (
              <ProjectNoteCard
                key={note.id}
                note={note}
                meetingPath={`/jurisdictions/${jurisdictionId}/submission-inbox/projects/${permitProject.id}/meetings/${note.projectMeetingId}`}
              />
            ))}
          </VStack>
        )}
      </Box>
    </FlexColumn>
  )
})

const FlexColumn = ({ children }: { children: React.ReactNode }) => (
  <Box flex={1} minH={0} minW={0} overflowY="auto" bg="greys.white" p={10}>
    {children}
  </Box>
)

const ProjectNoteCard = ({ note, meetingPath }: { note: INote; meetingPath: string }) => {
  const { t } = useTranslation()
  const createdAt = note.createdAt ? format(note.createdAt, datefnsTableDateTimeFormat) : null

  return (
    <Box border="1px" borderColor="border.light" borderRadius="md" p={4}>
      <VStack align="stretch" spacing={2}>
        <HStack spacing={4} align="baseline">
          <Text fontWeight="bold">{note.authorName}</Text>
          {createdAt && (
            <Text color="text.secondary" fontSize="sm">
              {createdAt}
            </Text>
          )}
        </HStack>
        <SafeTipTapDisplay htmlContent={note.body} fontSize="md" />
        {note.projectMeetingId && (
          <RouterLink to={meetingPath} color="text.link" fontSize="sm">
            {t("submissionInbox.projectDetail.viewProjectMeeting")}
          </RouterLink>
        )}
      </VStack>
    </Box>
  )
}
