import { Box, Heading, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { usePreCheck } from "../../../../hooks/resources/use-pre-check"
import { useMst } from "../../../../setup/root"
import { FormFooter } from "./form-footer"

export const UploadDrawings = observer(function UploadDrawings() {
  const { t } = useTranslation()
  const { currentPreCheck } = usePreCheck()
  const {
    preCheckStore: { updatePreCheck },
  } = useMst()
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = async () => {
    if (!currentPreCheck) return

    setIsLoading(true)
    try {
      await updatePreCheck(currentPreCheck.id, {
        // Add your form data here
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>
        {t("preCheck.sections.uploadDrawings.title", "Upload Drawings")}
      </Heading>
      <Text mb={6}>{t("preCheck.sections.uploadDrawings.description", "Upload your building drawings.")}</Text>

      <VStack spacing={4} align="stretch">
        {/* Form fields will go here */}
        <Text color="text.secondary">Form fields coming soon...</Text>
      </VStack>

      <FormFooter onContinue={handleContinue} isLoading={isLoading} />
    </Box>
  )
})
