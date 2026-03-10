import { Box, Button, Heading, Stack, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { IPart3StepCodeChecklist } from "../../../../../models/part-3-step-code-checklist"
import { TextFormControl } from "../../../../shared/form/input-form-control"
import { usePart3Navigation } from "../use-part-3-navigation"

interface IStepcodeContactForm {
  completedByName?: string | null
  completedByTitle?: string | null
  completedByEmail?: string | null
  completedByOrganizationName?: string | null
  completedByPhoneNumber?: string | null
}

function initializeFormValues(checklist?: IPart3StepCodeChecklist): IStepcodeContactForm {
  return {
    completedByName: checklist?.completedByName || null,
    completedByTitle: checklist?.completedByTitle || null,
    completedByEmail: checklist?.completedByEmail || null,
    completedByOrganizationName: checklist?.completedByOrganizationName || null,
    completedByPhoneNumber: checklist?.completedByPhoneNumber || null,
  }
}

const i18nPrefix = "stepCode.part3.completedByContact"

export const Contact = observer(() => {
  const { t } = useTranslation()
  const { checklist } = usePart3StepCode()
  const formMethods = useForm<IStepcodeContactForm>({
    mode: "onSubmit",
    defaultValues: initializeFormValues(checklist),
  })
  const { handleSubmit } = formMethods
  const navigate = useNavigate()
  const { navigateToNext, goBackPath } = usePart3Navigation()

  const onSubmit = handleSubmit(async (values, event) => {
    if (!checklist) return

    const saveAndGoBack = (event?.nativeEvent as CustomEvent)?.detail?.saveAndGoBack

    const updated = await checklist.update(values)
    if (!updated) {
      return
    }
    await checklist.completeSection("contact")

    if (saveAndGoBack) {
      navigate(goBackPath)
    } else {
      navigateToNext()
    }
  })

  return (
    <Box w="full">
      <Heading as="h2" fontSize="2xl" variant="yellowline">
        {t(`${i18nPrefix}.heading`)}
      </Heading>
      <Text fontSize="md">{t(`${i18nPrefix}.description`)}</Text>
      <Text fontSize="md" mt={5}>
        {t(`${i18nPrefix}.disclaimer`)}
      </Text>

      <FormProvider {...formMethods}>
        <Box as="form" onSubmit={onSubmit} mt={9} maxW="26.875rem" name="part3SectionForm">
          <Stack direction="column" spacing={7}>
            <TextFormControl fieldName="completedByName" label={t(`${i18nPrefix}.fields.completedByName`)} required />
            <TextFormControl fieldName="completedByTitle" label={t(`${i18nPrefix}.fields.completedByTitle`)} required />
            <TextFormControl
              fieldName="completedByEmail"
              inputProps={{ type: "email" }}
              label={t(`${i18nPrefix}.fields.completedByEmail`)}
              required
            />
            <TextFormControl
              fieldName="completedByOrganizationName"
              label={t(`${i18nPrefix}.fields.completedByOrganization`)}
              required
            />
          </Stack>
          <Button type="submit" variant="primary" mt={6}>
            {t("stepCode.part3.cta")}
          </Button>
        </Box>
      </FormProvider>
    </Box>
  )
})
