import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IJurisdiction } from "../../../../../../models/jurisdiction"
import { ESubmissionContactClass } from "../../../../../../types/enums"
import { SubmissionContactForm } from "../shared/submission-contact-form"

interface IProjectMeetingsNotificationRecipientsFormProps {
  jurisdiction: IJurisdiction
}

export const ProjectMeetingsNotificationRecipientsForm = observer(function ProjectMeetingsNotificationRecipientsForm({
  jurisdiction,
}: IProjectMeetingsNotificationRecipientsFormProps) {
  const { t } = useTranslation()
  const i18nPrefix = "home.configurationManagement.featureAccess"

  return (
    <SubmissionContactForm
      jurisdiction={jurisdiction}
      contactClass={ESubmissionContactClass.meeting}
      emailLabel={t(`${i18nPrefix}.projectMeetingsEmailLabel`)}
      addEmailLabel={t(`${i18nPrefix}.projectMeetingsAddEmail`)}
      confirmationRequiredLabel={t(`${i18nPrefix}.projectMeetingsConfirmationRequired`)}
    />
  )
})
