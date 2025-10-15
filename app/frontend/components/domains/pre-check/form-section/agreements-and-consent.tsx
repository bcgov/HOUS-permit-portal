import { Box, Checkbox, Heading, Link, Stack, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { usePreCheck } from "../../../../hooks/resources/use-pre-check"
import { useMst } from "../../../../setup/root"
import { FormFooter } from "./form-footer"

interface IAgreementsFormData {
  eulaAccepted: boolean
  consentToSendDrawings: boolean
  consentToShareWithJurisdiction: boolean
  consentToResearchContact: boolean
}

export const AgreementsAndConsent = observer(function AgreementsAndConsent() {
  const { t } = useTranslation()
  const { currentPreCheck } = usePreCheck()
  const {
    preCheckStore: { updatePreCheck },
  } = useMst()

  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
    control,
  } = useForm<IAgreementsFormData>({
    defaultValues: {
      eulaAccepted: currentPreCheck?.eulaAccepted || false,
      consentToSendDrawings: currentPreCheck?.consentToSendDrawings || false,
      consentToShareWithJurisdiction: currentPreCheck?.consentToShareWithJurisdiction || false,
      consentToResearchContact: currentPreCheck?.consentToResearchContact || false,
    },
  })

  const formValues = watch()

  const onSubmit = async (data: IAgreementsFormData) => {
    if (!currentPreCheck) return
    await updatePreCheck(currentPreCheck.id, {
      eulaAccepted: data.eulaAccepted,
      consentToSendDrawings: data.consentToSendDrawings,
      consentToShareWithJurisdiction: data.consentToShareWithJurisdiction,
      consentToResearchContact: data.consentToResearchContact,
    })
  }

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>
        {t("preCheck.sections.agreementsAndConsent.title")}
      </Heading>
      <Text mb={6}>
        {t("preCheck.sections.agreementsAndConsent.description")}{" "}
        <Link href="/profile/eula" isExternal>
          {t("preCheck.sections.agreementsAndConsent.readEula")}
        </Link>
      </Text>

      <VStack spacing={6} align="stretch">
        <Stack spacing={4}>
          <Controller
            name="eulaAccepted"
            control={control}
            rules={{ required: t("preCheck.sections.agreementsAndConsent.eulaRequired") }}
            render={({ field, fieldState }) => (
              <>
                <Checkbox
                  isChecked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  isDisabled={currentPreCheck?.eulaAccepted === true}
                >
                  {t("preCheck.sections.agreementsAndConsent.eulaCheckbox")}
                </Checkbox>
                {fieldState.error && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {fieldState.error.message}
                  </Text>
                )}
              </>
            )}
          />
          <Controller
            name="consentToSendDrawings"
            control={control}
            rules={{ required: t("preCheck.sections.agreementsAndConsent.sendDrawingsRequired") }}
            render={({ field, fieldState }) => (
              <>
                <Checkbox
                  isChecked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  isDisabled={currentPreCheck?.consentToSendDrawings === true}
                >
                  {t("preCheck.sections.agreementsAndConsent.sendDrawingsCheckbox")}
                </Checkbox>
                {fieldState.error && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {fieldState.error.message}
                  </Text>
                )}
              </>
            )}
          />
        </Stack>

        <Box>
          <Heading as="h3" size="md" mb={3}>
            {t("preCheck.sections.agreementsAndConsent.shareSubmissionTitle")}
          </Heading>
          <Text mb={4} fontSize="sm" color="text.secondary">
            {t("preCheck.sections.agreementsAndConsent.shareSubmissionDescription", {
              jurisdictionName: currentPreCheck?.jurisdiction?.name || t("jurisdiction.yourJurisdiction"),
            })}
          </Text>
          <Box as="ul" pl={6} mb={4} fontSize="sm">
            <li>{t("preCheck.sections.agreementsAndConsent.shareItem1")}</li>
            <li>{t("preCheck.sections.agreementsAndConsent.shareItem2")}</li>
            <li>{t("preCheck.sections.agreementsAndConsent.shareItem3")}</li>
          </Box>
          <Text mb={4} fontSize="sm" color="text.secondary">
            {t("preCheck.sections.agreementsAndConsent.shareSubmissionNote", {
              jurisdictionName: currentPreCheck?.jurisdiction?.name || t("jurisdiction.yourJurisdiction"),
            })}
          </Text>
          <Checkbox
            {...register("consentToShareWithJurisdiction")}
            isChecked={formValues.consentToShareWithJurisdiction}
          >
            {t("preCheck.sections.agreementsAndConsent.shareWithJurisdictionCheckbox", {
              jurisdictionName: currentPreCheck?.jurisdiction?.name || t("jurisdiction.yourJurisdiction"),
            })}{" "}
            <strong>{t("ui.optional")}</strong>
          </Checkbox>
        </Box>

        <Box>
          <Heading as="h3" size="md" mb={3}>
            {t("preCheck.sections.agreementsAndConsent.researchTitle")}
          </Heading>
          <Text mb={4} fontSize="sm" color="text.secondary">
            {t("preCheck.sections.agreementsAndConsent.researchDescription")}
          </Text>
          <Checkbox {...register("consentToResearchContact")} isChecked={formValues.consentToResearchContact}>
            {t("preCheck.sections.agreementsAndConsent.researchCheckbox")} <strong>{t("ui.optional")}</strong>
          </Checkbox>
        </Box>
      </VStack>

      <FormFooter<IAgreementsFormData> handleSubmit={handleSubmit} onSubmit={onSubmit} isLoading={isSubmitting} />
    </Box>
  )
})
