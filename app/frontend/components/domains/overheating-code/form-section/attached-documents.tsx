import { Box, Button, CloseButton, Field, Heading, HStack, Input, Text, VStack } from "@chakra-ui/react"
import { Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useOverheatingCode } from "../../../../hooks/resources/use-overheating-code"
import { useMst } from "../../../../setup/root"
import { FormFooter } from "./form-footer"

interface IAttachedDocumentsFormData {
  documentNotes: { value: string }[]
}

const MAX_LINES = 5

export const AttachedDocuments = observer(function AttachedDocuments() {
  const { t } = useTranslation()
  const { currentOverheatingCode } = useOverheatingCode()
  const {
    overheatingCodeStore: { updateOverheatingCode },
  } = useMst()

  const toFieldArray = (arr: string[] | undefined) =>
    arr && arr.length > 0 ? arr.map((v) => ({ value: v })) : [{ value: "" }]

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<IAttachedDocumentsFormData>({
    mode: "onChange",
    defaultValues: {
      documentNotes: toFieldArray(currentOverheatingCode?.documentNotes as unknown as string[]),
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "documentNotes" })

  const onSubmit = async (data: IAttachedDocumentsFormData) => {
    if (!currentOverheatingCode) return
    await updateOverheatingCode(currentOverheatingCode.id, {
      documentNotes: data.documentNotes.map((f) => f.value).filter(Boolean),
    })
  }

  return (
    <Box>
      <Heading as="h2" size="lg" mb={2}>
        {t("overheatingCode.sections.attachedDocuments.title", "Attached Documents & Notes")}
      </Heading>
      <Text mb={6} color="text.secondary">
        {t(
          "overheatingCode.sections.attachedDocuments.description",
          "List documents that accompany this report, along with any relevant notes."
        )}
      </Text>
      <VStack gap={4} align="stretch">
        {fields.map((field, index) => (
          <Field.Root key={field.id}>
            <Field.Label fontSize="sm" fontWeight="semibold">
              {t("overheatingCode.sections.attachedDocuments.lineLabel", "Line {{number}}:", {
                number: index + 1,
              })}
            </Field.Label>
            <HStack>
              <Input
                {...register(`documentNotes.${index}.value`)}
                placeholder={t(
                  "overheatingCode.sections.attachedDocuments.linePlaceholder",
                  "e.g. Plans, Window & Door Schedules, insulation details..."
                )}
              />
              {fields.length > 1 && <CloseButton onClick={() => remove(index)} aria-label="Remove line" />}
            </HStack>
          </Field.Root>
        ))}

        {fields.length < MAX_LINES && (
          <Box>
            <Button variant="plain" colorPalette="blue" size="sm" onClick={() => append({ value: "" })}>
              <Plus />
              {t("overheatingCode.sections.attachedDocuments.addLine", "Add Line")}
            </Button>
          </Box>
        )}
      </VStack>
      <FormFooter<IAttachedDocumentsFormData> handleSubmit={handleSubmit} onSubmit={onSubmit} loading={isSubmitting} />
    </Box>
  )
})
