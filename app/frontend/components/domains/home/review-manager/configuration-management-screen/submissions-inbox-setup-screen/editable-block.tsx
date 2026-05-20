import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"
import { ErrorScreen } from "../../../../../shared/base/error-screen"
import { EmailListEditableBlock } from "../../../../../shared/form/email-list-editable-block"
import { i18nPrefix } from "./i18n-prefix"

interface IProps {
  heading?: string | null
  fields: Record<"id", string | null>[]
  fieldArrayName: string
  append: any
  remove: any
  update: any
  getIndex: (field: Record<"id", string | null>) => number
  reset: () => any
}

export const EditableBlock = observer(function SubmissionsInboxSetupEditableBlock({
  heading,
  fields,
  fieldArrayName,
  reset,
  append,
  remove,
  update,
  getIndex,
}: IProps) {
  const { currentJurisdiction, error } = useJurisdiction()
  const getSubmissionContact = currentJurisdiction?.getSubmissionContact

  return error ? (
    <ErrorScreen error={error} />
  ) : (
    <EmailListEditableBlock
      heading={heading}
      fields={fields}
      fieldArrayName={fieldArrayName}
      getIndex={getIndex}
      append={append}
      remove={remove}
      update={update}
      reset={reset}
      emailLabel={t(`${i18nPrefix}.emailLabel`)}
      addEmailLabel={t(`${i18nPrefix}.addEmail`)}
      confirmationRequiredLabel={t(`${i18nPrefix}.confirmationRequired`)}
      getItem={(id) => getSubmissionContact?.(id)}
      buildNewItem={() => ({ id: null, email: null, title: null, default: false })}
      buildDestroyedItem={(contact) => ({ _destroy: true, id: contact.id })}
      showConfirmationWarning
    />
  )
})
