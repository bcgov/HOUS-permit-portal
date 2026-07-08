import { FormControl, FormErrorMessage, FormLabel, Input, VStack } from "@chakra-ui/react"
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

interface ContactDetailsSectionProps {
  meeting: IProjectMeeting
}

export const ContactDetailsSection = observer(({ meeting }: ContactDetailsSectionProps) => {
  const { t } = useTranslation()
  const { permitProjectId } = useParams<{ permitProjectId: string }>()
  const { projectMeetingStore, uiStore } = useMst()
  const { navigateToNext } = useProjectMeetingNavigation()
  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      contactName: meeting.contactName || "",
      contactEmail: meeting.contactEmail || "",
      contactPhoneNumber: meeting.contactPhoneNumber || "",
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
        title={t("projectMeeting.sections.contactDetails.title")}
        description={t("projectMeeting.sections.contactDetails.description")}
      />
      <VStack align="stretch" spacing={4} maxW="md">
        <FormControl isRequired isInvalid={!!errors.contactName}>
          <FormLabel>{t("projectMeeting.contactName")}</FormLabel>
          <Input {...register("contactName", { required: t("projectMeeting.validation.contactNameRequired") })} />
          <FormErrorMessage>{errors.contactName?.message as string}</FormErrorMessage>
        </FormControl>
        <FormControl isRequired isInvalid={!!errors.contactEmail}>
          <FormLabel>{t("projectMeeting.contactEmail")}</FormLabel>
          <Input
            type="email"
            {...register("contactEmail", {
              required: t("projectMeeting.validation.contactEmailRequired"),
            })}
          />
          <FormErrorMessage>{errors.contactEmail?.message as string}</FormErrorMessage>
        </FormControl>
        <FormControl>
          <FormLabel>{t("projectMeeting.contactPhoneNumber")}</FormLabel>
          <Input {...register("contactPhoneNumber")} />
        </FormControl>
      </VStack>
      <FormActions isSubmitting={formState.isSubmitting} />
    </form>
  )
})
