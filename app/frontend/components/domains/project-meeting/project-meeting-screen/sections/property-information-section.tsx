import { FormControl, FormErrorMessage, HStack, Radio, RadioGroup } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { IProjectMeeting } from "../../../../../models/project-meeting"
import { useMst } from "../../../../../setup/root"
import { EFlashMessageStatus } from "../../../../../types/enums"
import { useProjectMeetingNavigation } from "../../use-project-meeting-navigation"
import { FormActions } from "../shared/form-actions"
import { SectionHeading } from "../shared/section-heading"

interface PropertyInformationSectionProps {
  meeting: IProjectMeeting
}

export const PropertyInformationSection = observer(({ meeting }: PropertyInformationSectionProps) => {
  const { t } = useTranslation()
  const { permitProjectId } = useParams<{ permitProjectId: string }>()
  const { projectMeetingStore, uiStore } = useMst()
  const { navigateToNext } = useProjectMeetingNavigation()
  const { control, handleSubmit, formState } = useForm({
    defaultValues: {
      requestPropertyInformation:
        meeting.requestPropertyInformation === null ? "" : String(meeting.requestPropertyInformation),
    },
  })
  const propertyInformationError = formState.errors.requestPropertyInformation

  const onSubmit = async (data) => {
    const response = await projectMeetingStore.updateProjectMeeting(permitProjectId, meeting.id, {
      requestPropertyInformation: data.requestPropertyInformation === "true",
    })
    if (response.ok) {
      navigateToNext()
    } else {
      uiStore.flashMessage.show(EFlashMessageStatus.error, null, t("projectMeeting.validation.saveError"), 5000)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SectionHeading
        title={t("projectMeeting.sections.propertyInformation.title")}
        description={t("projectMeeting.sections.propertyInformation.description")}
      />
      <FormControl isRequired isInvalid={!!propertyInformationError}>
        <Controller
          name="requestPropertyInformation"
          control={control}
          rules={{ required: t("projectMeeting.validation.propertyInformationRequired") }}
          render={({ field }) => (
            <RadioGroup value={field.value} onChange={field.onChange}>
              <HStack spacing={3}>
                <Radio value="true">{t("ui.yes")}</Radio>
                <Radio value="false">{t("ui.no")}</Radio>
              </HStack>
            </RadioGroup>
          )}
        />
        <FormErrorMessage>{propertyInformationError?.message as string}</FormErrorMessage>
      </FormControl>
      <FormActions isSubmitting={formState.isSubmitting} />
    </form>
  )
})
