import { Box, Button, Flex, Heading, HStack, Text } from "@chakra-ui/react"
import { ChatText, Download } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { IPermitProject } from "../../../models/permit-project"
import { useMst } from "../../../setup/root"
import { ProjectMeetingNotesList } from "../../shared/project-meetings/project-meeting-notes-list"

interface IProps {
  permitProject: IPermitProject
}

export const ProjectNotesTabPanelContent = observer(({ permitProject }: IProps) => {
  const { t } = useTranslation()
  const { projectMeetingStore } = useMst()
  const notes = projectMeetingStore.currentPermitProjectNotes

  useEffect(() => {
    projectMeetingStore.fetchPermitProjectNotes(permitProject.id)
  }, [permitProject.id, projectMeetingStore])

  return (
    <Flex direction="column" flex={1} bg="greys.white" p={10}>
      <Box as="section">
        <HStack align="center" spacing={4} mb={6}>
          <ChatText size={32} />
          <Heading as="h2" size="lg" mb={0}>
            {t("permitProject.details.notes")}
          </Heading>
        </HStack>

        <Box bg="background.blueLight" borderRadius="lg" p={8} mb={6}>
          <Heading as="h3" size="md" mb={4}>
            {t("permitProject.notes.infoTitle")}
          </Heading>
          <Text mb={5}>{t("permitProject.notes.infoDescription")}</Text>
          <Button
            variant="secondary"
            leftIcon={<Download size={16} />}
            onClick={() => projectMeetingStore.downloadPermitProjectNotesCsv(permitProject)}
          >
            {t("projectMeeting.detail.notes.downloadAll")}
          </Button>
        </Box>

        <Heading as="h3" size="md" mb={4}>
          {t("submissionInbox.projectDetail.projectMeetingNotes")}
        </Heading>

        <ProjectMeetingNotesList
          notes={notes}
          emptyDescription={t("permitProject.notes.emptyDescription")}
          getMeetingPath={(note) => `/projects/${permitProject.id}/meetings/${note.projectMeetingId}`}
        />
      </Box>
    </Flex>
  )
})
