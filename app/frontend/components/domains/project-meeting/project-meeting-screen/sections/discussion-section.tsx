import { FormControl, FormErrorMessage, FormLabel, Text, Textarea, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { IProjectMeeting } from "../../../../../models/project-meeting"
import { useMst } from "../../../../../setup/root"
import { EFlashMessageStatus } from "../../../../../types/enums"
import { useProjectMeetingNavigation } from "../../use-project-meeting-navigation"
import { FormActions } from "../shared/form-actions"
import { SectionHeading } from "../shared/section-heading"

interface DiscussionSectionProps {
  meeting: IProjectMeeting
}

export const DiscussionSection = observer(({ meeting }: DiscussionSectionProps) => {
  const { t } = useTranslation()
  const { permitProjectId } = useParams<{ permitProjectId: string }>()
  const { projectMeetingStore, uiStore } = useMst()
  const { navigateToNext } = useProjectMeetingNavigation()
  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      projectDescription: meeting.projectDescription || "",
      meetingNotes: meeting.meetingNotes || "",
    },
  })
  const { errors } = formState

  const onSubmit = async (data) => {
    const response = await projectMeetingStore.updateProjectMeeting(permitProjectId, meeting.id, data)
    if (response.ok) {
      navigateToNext()
    } else {
      uiStore.flashMessage.show(EFlashMessageStatus.error, null, t("projectMeeting.validation.saveError"), 5000)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SectionHeading
        title={t("projectMeeting.sections.discussion.title")}
        description={t("projectMeeting.sections.discussion.description")}
      />
      <VStack align="stretch" spacing={8} maxW="xl">
        <FormControl isRequired isInvalid={!!errors.projectDescription}>
          <FormLabel>{t("projectMeeting.projectDescription")}</FormLabel>
          <Textarea
            minH="120px"
            {...register("projectDescription", {
              required: t("projectMeeting.validation.projectDescriptionRequired"),
            })}
          />
          <Text fontSize="sm" color="text.secondary" mt={1}>
            {t("projectMeeting.projectDescriptionHint")}
          </Text>
          <FormErrorMessage>{errors.projectDescription?.message as string}</FormErrorMessage>
        </FormControl>
        <FormControl>
          <FormLabel>{t("projectMeeting.meetingNotes")}</FormLabel>
          <Textarea minH="120px" {...register("meetingNotes")} />
          <Text fontSize="sm" color="text.secondary" mt={1}>
            {t("projectMeeting.meetingNotesHint")}
          </Text>
        </FormControl>
      </VStack>
      <FormActions isSubmitting={formState.isSubmitting} />
    </form>
  )
})
