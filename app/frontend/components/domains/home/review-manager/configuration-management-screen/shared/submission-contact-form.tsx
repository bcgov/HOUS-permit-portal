import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect } from "react"
import { FormProvider, useFieldArray, useForm } from "react-hook-form"
import { IJurisdiction } from "../../../../../../models/jurisdiction"
import { ESubmissionContactClass } from "../../../../../../types/enums"
import { EmailListEditableBlock } from "../../../../../shared/form/email-list-editable-block"

interface ISubmissionContactFormProps {
  jurisdiction: IJurisdiction
  contactClass: ESubmissionContactClass
  emailLabel: string
  addEmailLabel: string
  confirmationRequiredLabel: string
}

interface ISubmissionContactField {
  id: string | null
  email: string | null
  title?: string | null
  default?: boolean
  type: ESubmissionContactClass
  _destroy?: boolean
}

interface IFormValues {
  submissionContactsAttributes: ISubmissionContactField[]
}

export const SubmissionContactForm = observer(function SubmissionContactForm({
  jurisdiction,
  contactClass,
  emailLabel,
  addEmailLabel,
  confirmationRequiredLabel,
}: ISubmissionContactFormProps) {
  const contacts = jurisdiction.submissionContacts.filter((contact) => contact.type === contactClass)

  const contactFields = (): ISubmissionContactField[] =>
    contacts.length > 0
      ? contacts.map((contact) => ({
          id: contact.id,
          email: contact.email,
          title: contact.title ?? null,
          default: contact.default ?? false,
          type: contactClass,
        }))
      : [{ id: null, email: null, title: null, default: false, type: contactClass }]

  const fieldArrayName = "submissionContactsAttributes"
  const formMethods = useForm<IFormValues>({
    mode: "onChange",
    defaultValues: {
      submissionContactsAttributes: contactFields(),
    },
  })
  const { handleSubmit, reset, control, setValue } = formMethods
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: fieldArrayName,
  })

  const contactSignature = contacts
    .map((contact) => [contact.id, contact.email, contact.confirmedAt, contact.confirmationSentAt].join(":"))
    .join("|")

  const getIndex = (field) => R.findIndex((f) => f.id == field.id, fields)

  const onSubmit = async (values: IFormValues) => {
    return await jurisdiction.update(values)
  }

  const handleReset = () => {
    reset({ submissionContactsAttributes: contactFields() })
  }

  useEffect(() => {
    setValue("submissionContactsAttributes", contactFields())
  }, [jurisdiction.id, contactClass, contactSignature])

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
        <EmailListEditableBlock
          fields={fields}
          fieldArrayName={fieldArrayName}
          getIndex={getIndex}
          append={append}
          remove={remove}
          update={update}
          reset={handleReset}
          emailLabel={emailLabel}
          addEmailLabel={addEmailLabel}
          confirmationRequiredLabel={confirmationRequiredLabel}
          getItem={(id) => jurisdiction.getSubmissionContact(id)}
          buildNewItem={() => ({ id: null, email: null, title: null, default: false, type: contactClass })}
          buildDestroyedItem={(contact) => ({ _destroy: true, id: contact.id, type: contactClass })}
          showConfirmationWarning
        />
      </form>
    </FormProvider>
  )
})
