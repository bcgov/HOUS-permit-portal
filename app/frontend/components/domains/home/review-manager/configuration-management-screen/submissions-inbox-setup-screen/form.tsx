import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect } from "react"
import { FormProvider, useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IJurisdiction } from "../../../../../../models/jurisdiction"
import { EditableBlock } from "./editable-block"

interface IFormProps {
  jurisdiction: IJurisdiction
}

interface IFormValues {
  submissionContactsAttributes: Array<{
    id: string | null
    email: string | null
    title?: string | null
    default?: boolean
  }>
  inboxEnabled: boolean
}

export const Form = observer(function SubmissionInboxSetupForm({ jurisdiction }: IFormProps) {
  const { t } = useTranslation()
  const { submissionContacts, inboxEnabled } = jurisdiction

  const getDefaultValues = (): IFormValues => ({
    submissionContactsAttributes:
      submissionContacts.length > 0
        ? submissionContacts.map((c) => ({
            id: c.id,
            email: c.email,
            title: c.title ?? null,
            default: c.default ?? false,
          }))
        : [{ id: null, email: null, title: null, default: false }],
    inboxEnabled,
  })

  const fieldArrayName = "submissionContactsAttributes"
  const formMethods = useForm<IFormValues>({
    mode: "onChange",
    defaultValues: getDefaultValues(),
  })
  const { handleSubmit, reset, control, setValue, watch } = formMethods
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: fieldArrayName,
  })

  const inboxEnabledWatch = watch("inboxEnabled")

  const getIndex = (field) => R.findIndex((f) => f.id == field.id, fields)

  const onSubmit = async (values) => {
    return await jurisdiction.update(values)
  }

  const handleReset = () => {
    reset(getDefaultValues())
  }

  useEffect(() => {
    if (jurisdiction) {
      setValue(
        "submissionContactsAttributes",
        submissionContacts.length > 0
          ? submissionContacts.map((c) => ({
              id: c.id,
              email: c.email,
              title: c.title ?? null,
              default: c.default ?? false,
            }))
          : [{ id: null, email: null, title: null, default: false }]
      )
      setValue("inboxEnabled", inboxEnabled)
    }
  }, [jurisdiction?.id])

  useEffect(() => {
    if (inboxEnabledWatch === jurisdiction.inboxEnabled) return
    handleSubmit(onSubmit)()
  }, [inboxEnabledWatch])

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
        <EditableBlock
          fields={fields}
          fieldArrayName={fieldArrayName}
          getIndex={getIndex}
          append={append}
          remove={remove}
          update={update}
          reset={handleReset}
        />
      </form>
    </FormProvider>
  )
})
