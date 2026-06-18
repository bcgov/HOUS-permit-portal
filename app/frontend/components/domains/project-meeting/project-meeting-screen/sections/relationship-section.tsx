import { FormControl, FormErrorMessage, Radio, RadioGroup, Stack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { IProjectMeeting } from "../../../../../models/project-meeting"
import { useMst } from "../../../../../setup/root"
import { EFlashMessageStatus, EProjectMeetingRequesterRelationship } from "../../../../../types/enums"
import { useProjectMeetingNavigation } from "../../use-project-meeting-navigation"
import { FormActions } from "../shared/form-actions"
import { SectionHeading } from "../shared/section-heading"

interface RelationshipSectionProps {
  meeting: IProjectMeeting
}

export const RelationshipSection = observer(({ meeting }: RelationshipSectionProps) => {
  const { t } = useTranslation()
  const { permitProjectId } = useParams<{ permitProjectId: string }>()
  const { projectMeetingStore, uiStore } = useMst()
  const { navigateToNext } = useProjectMeetingNavigation()
  const { control, handleSubmit, formState } = useForm({
    defaultValues: { requesterRelationship: meeting.requesterRelationship || "" },
  })
  const relationshipError = formState.errors.requesterRelationship

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
      <SectionHeading title={t("projectMeeting.sections.relationship.title")} />
      <FormControl isRequired isInvalid={!!relationshipError}>
        <Controller
          name="requesterRelationship"
          control={control}
          rules={{ required: t("projectMeeting.validation.relationshipRequired") }}
          render={({ field }) => (
            <RadioGroup value={field.value} onChange={field.onChange}>
              <Stack spacing={3}>
                {Object.values(EProjectMeetingRequesterRelationship).map((relationship) => (
                  <Radio key={relationship} value={relationship}>
                    {t(`projectMeeting.relationships.${relationship}`)}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
          )}
        />
        <FormErrorMessage>{relationshipError?.message as string}</FormErrorMessage>
      </FormControl>
      <FormActions isSubmitting={formState.isSubmitting} />
    </form>
  )
})
