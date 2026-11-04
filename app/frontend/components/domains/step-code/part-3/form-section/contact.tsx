import { Box, Heading, Stack, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { IPart3StepCodeChecklist } from "../../../../../models/part-3-step-code-checklist"
import { IUser } from "../../../../../models/user"
import { useMst } from "../../../../../setup/root"
import { TextFormControl } from "../../../../shared/form/input-form-control"
import { Part3FormFooter } from "./shared/form-footer"

interface IStepcodeContactForm {
  completedByName?: string | null
  completedByTitle?: string | null
  completedByEmail?: string | null
  completedByOrganizationName?: string | null
  completedByPhoneNumber?: string | null
}

function profileName(user?: IUser) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null
}

function contactFormValues(checklist?: IPart3StepCodeChecklist, user?: IUser): IStepcodeContactForm {
  return {
    completedByName: checklist?.completedByName || profileName(user),
    completedByTitle: checklist?.completedByTitle || null,
    completedByEmail: checklist?.completedByEmail || user?.email || null,
    completedByOrganizationName: checklist?.completedByOrganizationName || user?.organization || null,
    completedByPhoneNumber: checklist?.completedByPhoneNumber || null,
  }
}

const i18nPrefix = "stepCode.part3.completedByContact"

export const Contact = observer(() => {
  const { t } = useTranslation()
  const { checklist } = usePart3StepCode()
  const {
    userStore: { currentUser },
  } = useMst()
  const formMethods = useForm<IStepcodeContactForm>({
    mode: "onSubmit",
    defaultValues: contactFormValues(checklist, currentUser),
  })
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = formMethods

  useEffect(() => {
    if (!checklist) return
    reset(contactFormValues(checklist, currentUser))
  }, [checklist?.id, currentUser?.id])

  const onSubmit = async (values) => {
    if (!checklist) return

    const updated = await checklist.update(values)
    if (!updated) throw new Error("Save failed")
    await checklist.completeSection("contact")
  }

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
        <Box mt={9} maxW="26.875rem">
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
          <Part3FormFooter handleSubmit={handleSubmit} onSubmit={onSubmit} isLoading={isSubmitting} />
        </Box>
      </FormProvider>
    </Box>
  )
})
