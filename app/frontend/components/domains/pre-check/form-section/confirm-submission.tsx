import { Box, Button, Flex, Grid, Heading, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { usePreCheck } from "../../../../hooks/resources/use-pre-check"
import { useMst } from "../../../../setup/root"
import { ConfirmationModal } from "../../../shared/confirmation-modal"
import { PreCheckBackLink } from "../pre-check-back-link"
import { usePreCheckNavigation } from "../use-pre-check-navigation"

export const ConfirmSubmission = observer(function ConfirmSubmission() {
  const { t } = useTranslation()
  const { currentPreCheck } = usePreCheck()
  const { navigateToNext } = usePreCheckNavigation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    preCheckStore: { updatePreCheck },
  } = useMst()

  const handleSubmit = async (closeModal: () => void) => {
    if (!currentPreCheck) return

    setIsSubmitting(true)
    try {
      const result = await updatePreCheck(currentPreCheck.id, {
        isSubmitted: true,
        status: "submitted",
      })

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

  const designDocuments = currentPreCheck?.designDocuments || []
  const uploadedFilesCount = designDocuments.filter((doc) => !doc._destroy).length

  return (
    <Box>
      <PreCheckBackLink />
      <Heading as="h2" size="lg" mb={6}>
        {t("preCheck.sections.confirmSubmission.title", "Review and submit")}
      </Heading>

      <VStack spacing={6} align="stretch" mb={8}>
        {/* Project and Application Numbers */}
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8}>
          <Box>
            <Heading as="h3" size="sm" mb={2} fontWeight="bold">
              {t("preCheck.sections.confirmSubmission.projectNumber", "Project number")}
            </Heading>
            <Text color="text.secondary">—</Text>
          </Box>
          <Box>
            <Heading as="h3" size="sm" mb={2} fontWeight="bold">
              {t("preCheck.sections.confirmSubmission.applicationNumber", "Application number")}
            </Heading>
            <Text color="text.secondary">—</Text>
          </Box>
        </Grid>

        {/* Address */}
        <Box>
          <Heading as="h3" size="sm" mb={2} fontWeight="bold">
            {t("preCheck.sections.confirmSubmission.address", "Address")}
          </Heading>
          {currentPreCheck?.fullAddress ? (
            <Text>{currentPreCheck.fullAddress}</Text>
          ) : (
            <Text color="text.secondary">—</Text>
          )}
        </Box>

        {/* Jurisdiction */}
        <Box>
          <Heading as="h3" size="sm" mb={2} fontWeight="bold">
            {t("preCheck.sections.confirmSubmission.jurisdiction", "Jurisdiction")}
          </Heading>
          {currentPreCheck?.jurisdiction?.name ? (
            <Text>{currentPreCheck.jurisdiction.name}</Text>
          ) : (
            <Text color="text.secondary">—</Text>
          )}
        </Box>

        {/* Uploaded Files */}
        <Box>
          <Heading as="h3" size="sm" mb={2} fontWeight="bold">
            {t("preCheck.sections.confirmSubmission.uploadedFiles", "Uploaded files ({{count}})", {
              count: uploadedFilesCount,
            })}
          </Heading>
          {designDocuments.length > 0 ? (
            <VStack align="stretch" spacing={1}>
              {designDocuments
                .filter((doc) => !doc._destroy)
                .map((doc) => (
                  <Text key={doc.id || doc.file?.id}>{doc.file?.metadata?.filename || "Unknown file"}</Text>
                ))}
            </VStack>
          ) : (
            <Text color="text.secondary">{t("preCheck.sections.confirmSubmission.noFiles", "No files uploaded")}</Text>
          )}
        </Box>
      </VStack>

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
                  isDisabled={!currentPreCheck?.isReadyForSubmission}
                  {...props}
                >
                  {t("preCheck.sections.confirmSubmission.submit", "Submit")}
                </Button>
              )}
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
            {t("ui.continue", "Continue")}
          </Button>
        )}
      </Flex>
    </Box>
  )
})
