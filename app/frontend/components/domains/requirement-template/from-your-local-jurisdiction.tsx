import { Box, Heading, HStack, Text } from "@chakra-ui/react"
import { Buildings } from "@phosphor-icons/react"
import { format } from "date-fns"
import React from "react"
import { useTranslation } from "react-i18next"
import { isTipTapEmpty } from "../../../utils/utility-functions"
import { SafeTipTapDisplay } from "../../shared/editor/safe-tiptap-display"

export const LOCAL_COMMUNITY_SECTION_ID = "local-community"

export function FromYourLocalJurisdiction({
  html,
  updatedAt,
  jurisdictionName,
}: {
  html: string
  updatedAt?: string | Date | null
  jurisdictionName: string
}) {
  const { t } = useTranslation()
  if (isTipTapEmpty(html)) return null

  const dateLabel = updatedAt ? format(new Date(updatedAt), "d MMMM yyyy") : null

  return (
    <Box
      as="section"
      id={LOCAL_COMMUNITY_SECTION_ID}
      w="full"
      py={4}
      px={6}
      scrollMarginTop="var(--app-navbar-height)"
      bg="theme.blueLight"
      borderLeft="4px solid"
      borderColor="theme.blue"
      borderRadius="sm"
    >
      <HStack spacing={2} align="center">
        <Buildings size={20} />
        <Heading as="h3" fontSize="md" mb={0}>
          {t("requirementTemplate.explainer.fromYourLocalJurisdiction")}
        </Heading>
      </HStack>
      {dateLabel && (
        <Text fontSize="sm" color="text.secondary" mt={1} ml={7}>
          {t("requirementTemplate.explainer.lastUpdated", { date: dateLabel })}
        </Text>
      )}
      <Heading as="h4" fontSize="lg" mt={4} mb={1}>
        {jurisdictionName}
      </Heading>
      <Text fontSize="sm" color="text.secondary" mb={3}>
        {t("requirementTemplate.explainer.addedBy", { name: jurisdictionName })}
      </Text>
      <SafeTipTapDisplay htmlContent={html} />
    </Box>
  )
}
