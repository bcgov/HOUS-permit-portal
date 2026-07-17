import { Box, HStack, Text } from "@chakra-ui/react"
import { Clock } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitProject } from "../../../models/permit-project"
import { RouterLinkButton } from "../navigation/router-link-button"

interface IActiveProjectMeetingNoticeProps {
  permitProject: IPermitProject
}

export const ActiveProjectMeetingNotice = ({ permitProject }: IActiveProjectMeetingNoticeProps) => {
  const { t } = useTranslation()
  const activeProjectMeetingId = permitProject.activeProjectMeeting?.id

  if (!activeProjectMeetingId) return null

  return (
    <Box borderWidth={1} borderColor="border.light" borderRadius="md" p={4} w="full">
      <HStack align="flex-start" spacing={3}>
        <Clock size={16} />
        <Box>
          <Text fontWeight="bold">{t("permitProject.meetings.requestedTitle")}</Text>
          <Text fontSize="sm" color="text.secondary">
            {t("permitProject.meetings.requestedDescription")}{" "}
            <RouterLinkButton
              variant="link"
              size="sm"
              h="auto"
              minW={0}
              p={0}
              to={`/projects/${permitProject.id}/meetings/${activeProjectMeetingId}`}
            >
              {t("permitProject.meetings.viewRequest")}
            </RouterLinkButton>
          </Text>
        </Box>
      </HStack>
    </Box>
  )
}
