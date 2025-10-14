import { Box, Checkbox, Heading, Link, Stack, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
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
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, watch } = useForm<IAgreementsFormData>({
    defaultValues: {
      eulaAccepted: currentPreCheck?.eulaAccepted || false,
      consentToSendDrawings: currentPreCheck?.consentToSendDrawings || false,
      consentToShareWithJurisdiction: currentPreCheck?.consentToShareWithJurisdiction || false,
      consentToResearchContact: currentPreCheck?.consentToResearchContact || false,
    },
  })

  // Watch form values for controlled checkboxes
  const formValues = watch()

  const onSubmit = async (data: IAgreementsFormData) => {
    if (!currentPreCheck) return

    setIsLoading(true)
    try {
      await updatePreCheck(currentPreCheck.id, {
        eulaAccepted: data.eulaAccepted,
        consentToSendDrawings: data.consentToSendDrawings,
        consentToShareWithJurisdiction: data.consentToShareWithJurisdiction,
        consentToResearchContact: data.consentToResearchContact,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>
        {t("preCheck.sections.agreementsAndConsent.title", "Agreements and Consent")}
      </Heading>
      <Text mb={6}>
        {t(
          "preCheck.sections.agreementsAndConsent.description",
          "To use this service, you need to agree to the End User Licence Agreement (EULA)."
        )}{" "}
        <Link href="/eulas/open.html" color="text.link" textDecoration="underline" isExternal>
          {t("preCheck.sections.agreementsAndConsent.readEula", "Read the full EULA")}
        </Link>
      </Text>

      <VStack spacing={6} align="stretch">
        <Stack spacing={4}>
          <Checkbox {...register("eulaAccepted")} isChecked={formValues.eulaAccepted}>
            {t(
              "preCheck.sections.agreementsAndConsent.eulaCheckbox",
              "I have read and agree to the End User Licence Agreement (EULA)"
            )}
          </Checkbox>

          <Checkbox {...register("consentToSendDrawings")} isChecked={formValues.consentToSendDrawings}>
            {t(
              "preCheck.sections.agreementsAndConsent.sendDrawingsCheckbox",
              "I consent to my drawings being sent to Archistar for pre-checking"
            )}
          </Checkbox>
        </Stack>

        <Box>
          <Heading as="h3" size="md" mb={3}>
            {t(
              "preCheck.sections.agreementsAndConsent.shareSubmissionTitle",
              "Share your submission details (optional)"
            )}
          </Heading>
          <Text mb={4} fontSize="sm" color="text.secondary">
            {t(
              "preCheck.sections.agreementsAndConsent.shareSubmissionDescription",
              "You can choose to share limited details from your submission with (Jurisdiction name) to help improve the accuracy of this service. This includes:"
            )}
          </Text>
          <Box as="ul" pl={6} mb={4} fontSize="sm">
            <li>{t("preCheck.sections.agreementsAndConsent.shareItem1", "project address")}</li>
            <li>{t("preCheck.sections.agreementsAndConsent.shareItem2", "date of submission")}</li>
            <li>{t("preCheck.sections.agreementsAndConsent.shareItem3", "results summary")}</li>
          </Box>
          <Text mb={4} fontSize="sm" color="text.secondary">
            {t(
              "preCheck.sections.agreementsAndConsent.shareSubmissionNote",
              "(Jurisdiction name) may use this information to review and compare the results of your pre-check."
            )}
          </Text>
          <Checkbox
            {...register("consentToShareWithJurisdiction")}
            isChecked={formValues.consentToShareWithJurisdiction}
          >
            {t(
              "preCheck.sections.agreementsAndConsent.shareWithJurisdictionCheckbox",
              "I agree to share details of this submission with (Jurisdiction name) (optional)"
            )}
          </Checkbox>
        </Box>

        <Box>
          <Heading as="h3" size="md" mb={3}>
            {t("preCheck.sections.agreementsAndConsent.researchTitle", "Take part in research (optional)")}
          </Heading>
          <Text mb={4} fontSize="sm" color="text.secondary">
            {t(
              "preCheck.sections.agreementsAndConsent.researchDescription",
              "You can let the Ministry of Housing and Municipal Affairs contact you about taking part in research to help improve this service."
            )}
          </Text>
          <Checkbox {...register("consentToResearchContact")} isChecked={formValues.consentToResearchContact}>
            {t(
              "preCheck.sections.agreementsAndConsent.researchCheckbox",
              "I agree to be contacted by the Ministry of Housing and Municipal Affairs about taking part in research (optional)"
            )}
          </Checkbox>
        </Box>
      </VStack>

      <FormFooter onContinue={handleSubmit(onSubmit)} isLoading={isLoading} />
    </Box>
  )
})
