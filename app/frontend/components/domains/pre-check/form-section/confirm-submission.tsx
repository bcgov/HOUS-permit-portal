import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { usePreCheck } from "../../../../hooks/resources/use-pre-check"
import { useMst } from "../../../../setup/root"
import { ConfirmationModal } from "../../../shared/confirmation-modal"
import { PreCheckBackLink } from "../pre-check-back-link"
import { PreCheckReviewDetails } from "../pre-check-review-details"
import { usePreCheckNavigation } from "../use-pre-check-navigation"

export const ConfirmSubmission = observer(function ConfirmSubmission() {
  const { t } = useTranslation()
  const { currentPreCheck } = usePreCheck()
  const { navigateToNext } = usePreCheckNavigation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    preCheckStore: { submitPreCheck },
    siteConfigurationStore,
  } = useMst()
  const { codeComplianceEnabled } = siteConfigurationStore

  const handleSubmit = async (closeModal: () => void) => {
    if (!currentPreCheck) return

    setIsSubmitting(true)
    try {
      const result = await submitPreCheck(currentPreCheck.id)

      if (result.ok) {
        closeModal()
        // Navigate to results
        navigateToNext()
      } else {
        // Handle error - could show a toast notification
        console.error("Failed to submit pre-check:", result.error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!currentPreCheck) return null

  return (
    <Box>
      <PreCheckBackLink />
      <Heading as="h2" size="lg" mb={6}>
        {t("preCheck.sections.confirmSubmission.title", "Review and submit")}
      </Heading>

      <PreCheckReviewDetails preCheck={currentPreCheck} />

      <Flex gap={3} mt={8}>
        {!currentPreCheck?.isSubmitted ? (
          <>
            <ConfirmationModal
              title={t("preCheck.sections.confirmSubmission.confirmTitle", "Confirm Submission")}
              body={t(
                "preCheck.sections.confirmSubmission.confirmBody",
                "Are you sure you want to submit this pre-check? Once submitted, you will not be able to make any changes."
              )}
              onConfirm={handleSubmit}
              renderTriggerButton={(props) => (
                <Button
                  variant="primary"
                  isLoading={isSubmitting}
                  isDisabled={!currentPreCheck?.isReadyForSubmission || !codeComplianceEnabled}
                  {...props}
                >
                  {t("preCheck.sections.confirmSubmission.submit", "Submit")}
                </Button>
              )}
              modalProps={{
                isCentered: true,
                zIndex: 2001,
              }}
              confirmButtonProps={{
                isLoading: isSubmitting,
              }}
            />
            {!currentPreCheck?.isReadyForSubmission && (
              <Text fontSize="sm" color="text.secondary" mt={2}>
                {t(
                  "preCheck.sections.confirmSubmission.completeAllFields",
                  "Please complete all required sections before submitting."
                )}
              </Text>
            )}
          </>
        ) : (
          <Button variant="primary" onClick={navigateToNext}>
            {t("ui.next", "Next")}
          </Button>
        )}
      </Flex>
    </Box>
  )
})
