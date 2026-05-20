import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect } from "react"
import { FormProvider, useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IJurisdiction } from "../../../../../../models/jurisdiction"
import { EmailListEditableBlock } from "../../../../../shared/form/email-list-editable-block"

interface IProjectMeetingsNotificationRecipientsFormProps {
  jurisdiction: IJurisdiction
}

interface IEmailRecipientField {
  email: string | null
}

interface IFormValues {
  projectMeetingNotificationRecipientEmailFields: IEmailRecipientField[]
}

export const ProjectMeetingsNotificationRecipientsForm = observer(function ProjectMeetingsNotificationRecipientsForm({
  jurisdiction,
}: IProjectMeetingsNotificationRecipientsFormProps) {
  const { t } = useTranslation()
  const i18nPrefix = "home.configurationManagement.featureAccess"
  const { projectMeetingNotificationRecipientEmails } = jurisdiction

  const emailFields = () =>
    projectMeetingNotificationRecipientEmails.map((email) => ({
      email,
    }))

  const getDefaultValues = (): IFormValues => ({
    projectMeetingNotificationRecipientEmailFields: emailFields(),
  })

  const fieldArrayName = "projectMeetingNotificationRecipientEmailFields"
  const formMethods = useForm<IFormValues>({
    mode: "onChange",
    defaultValues: getDefaultValues(),
  })
  const { handleSubmit, reset, control, setValue } = formMethods
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName,
  })

  const getIndex = (field) => R.findIndex((f) => f.id == field.id, fields)

  const onSubmit = async (values: IFormValues) => {
    const projectMeetingNotificationRecipientEmails: string[] = values.projectMeetingNotificationRecipientEmailFields
      .map((field) => field.email?.trim())
      .filter((email): email is string => !!email)

    return await jurisdiction.update({
      projectMeetingNotificationRecipientEmails,
    })
  }

  const handleReset = () => {
    reset(getDefaultValues())
  }

  useEffect(() => {
    setValue("projectMeetingNotificationRecipientEmailFields", emailFields())
  }, [jurisdiction.id, projectMeetingNotificationRecipientEmails.join("|")])

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
        <EmailListEditableBlock
          fields={fields}
          fieldArrayName={fieldArrayName}
          getIndex={getIndex}
          append={append}
          remove={remove}
          reset={handleReset}
          emailLabel={t(`${i18nPrefix}.projectMeetingsEmailLabel`)}
          addEmailLabel={t(`${i18nPrefix}.projectMeetingsAddEmail`)}
        />
      </form>
    </FormProvider>
  )
})
