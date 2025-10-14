import { Box, Heading, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { usePreCheck } from "../../../../hooks/resources/use-pre-check"
import { useMst } from "../../../../setup/root"
import { FormFooter } from "./form-footer"

interface IConfirmSubmissionFormData {
  finalConfirmation?: boolean
  // Add any final submission fields here
}

export const ConfirmSubmission = observer(function ConfirmSubmission() {
  const { t } = useTranslation()
  const { currentPreCheck } = usePreCheck()
  const {
    preCheckStore: { updatePreCheck },
  } = useMst()

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<IConfirmSubmissionFormData>({
    defaultValues: {
      finalConfirmation: false,
    },
  })

  const onSubmit = async (data: IConfirmSubmissionFormData) => {
    if (!currentPreCheck) return
    await updatePreCheck(currentPreCheck.id, {
      // Final submission logic will go here
    })
  }

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>
        {t("preCheck.sections.confirmSubmission.title", "Confirm Your Submission")}
      </Heading>
      <Text mb={6}>
        {t("preCheck.sections.confirmSubmission.description", "Review your information before submitting.")}
      </Text>

      <VStack spacing={4} align="stretch">
        {/* Form fields will go here */}
        <Text color="text.secondary">Form fields coming soon...</Text>
      </VStack>

      <FormFooter onContinue={handleSubmit(onSubmit)} isLoading={isSubmitting} />
    </Box>
  )
})
