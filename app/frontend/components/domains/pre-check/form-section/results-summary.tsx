import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { usePreCheck } from "../../../../hooks/resources/use-pre-check"

export const ResultsSummary = observer(function ResultsSummary() {
  const { t } = useTranslation()
  const { currentPreCheck } = usePreCheck()
  const navigate = useNavigate()

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>
        {t("preCheck.sections.resultsSummary.title", "Results Summary")}
      </Heading>
      <Text mb={6}>{t("preCheck.sections.resultsSummary.description", "View your pre-check results.")}</Text>

      <VStack spacing={4} align="stretch">
        {/* Results will go here */}
        <Text color="text.secondary">Results coming soon...</Text>
      </VStack>

      <Button variant="primary" mt={8} onClick={() => navigate("/pre-checks")}>
        {t("preCheck.form.backToPreChecks", "Back to Pre-Checks")}
      </Button>
    </Box>
  )
})
