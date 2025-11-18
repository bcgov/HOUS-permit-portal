import { VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect } from "react"
import { FormProvider, useFieldArray, useForm } from "react-hook-form"
import { IJurisdiction } from "../../../../../../models/jurisdiction"
import { useMst } from "../../../../../../setup/root"
import { EditableBlock } from "./editable-block"

interface IFormProps {
  jurisdiction: IJurisdiction
}

interface IFormValues {
  permitTypeSubmissionContactsAttributes: Array<{
    permitTypeId: string
    email: string | null
    id: string | null
  }>
  inboxEnabled: boolean
}

export const Form = observer(function SubmissionInboxSetupForm({ jurisdiction }: IFormProps) {
  const {
    permitClassificationStore: { permitTypes },
  } = useMst()
  const { permitTypeSubmissionContacts: submissionContacts, inboxEnabled } = jurisdiction

  const getDefaultValues = () => ({
    permitTypeSubmissionContactsAttributes: [...submissionContacts, ...defaults()],
    inboxEnabled: inboxEnabled, // Default value for the toggle
  })

  const defaults = () => {
    return permitTypes.reduce((result, permitType) => {
      const permitTypeContacts = submissionContacts.filter((c) => c.permitTypeId == permitType.id)
      if (R.isEmpty(permitTypeContacts)) {
        result.push({ permitTypeId: permitType.id, email: null, id: null })
      }
      return result
    }, [])
  }

  const fieldArrayName = "permitTypeSubmissionContactsAttributes"
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
    jurisdiction &&
      setValue("permitTypeSubmissionContactsAttributes", [...jurisdiction.permitTypeSubmissionContacts, ...defaults()])
    setValue("inboxEnabled", inboxEnabled) // Update inboxEnabled value
  }, [jurisdiction?.id])

  useEffect(() => {
    if (inboxEnabledWatch === jurisdiction.inboxEnabled) return
    handleSubmit(onSubmit)()
  }, [inboxEnabledWatch])

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
        <VStack spacing={5}>
          {/* Editable Blocks */}
          {permitTypes.map((permitType) => {
            const permitTypeFields = R.filter((f) => f.permitTypeId == permitType.id, fields)
            return (
              <EditableBlock
                key={permitType.id}
                heading={permitType.name}
                permitTypeId={permitType.id}
                fields={permitTypeFields}
                fieldArrayName={fieldArrayName}
                getIndex={getIndex}
                append={append}
                remove={remove}
                update={update}
                reset={handleReset}
              />
            )
          })}
        </VStack>
      </form>
    </FormProvider>
  )
})
