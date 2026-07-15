import { Box, Heading, Link } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { SummarySectionProps } from "../shared/types"

interface ReviewSummarySectionProps extends SummarySectionProps {
  onNavigateToSection: (sectionKey: string) => void
  showChangeLink?: boolean
}

export const ReviewSummarySection = ({
  title,
  sectionKey,
  children,
  onNavigateToSection,
  showChangeLink = true,
}: ReviewSummarySectionProps) => {
  const { t } = useTranslation()

  return (
    <Box mb={8}>
      <Heading as="h2" size="lg" variant="yellowline" mb={4}>
        {title}
      </Heading>
      {children}
      {showChangeLink && (
        <Link as="button" type="button" color="text.link" mt={2} onClick={() => onNavigateToSection(sectionKey)}>
          {t("ui.change")}
        </Link>
      )}
    </Box>
  )
}
