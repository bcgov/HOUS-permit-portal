import { Box, Flex, Heading, HStack, Text } from "@chakra-ui/react"
import { CalendarBlank } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"

export const InboxMeetingsTab = () => {
  const { t } = useTranslation()

  return (
    <Flex direction="column" flex={1} bg="greys.white" p={10}>
      <Box as="section">
        <HStack align="center" spacing={4} mb={6}>
          <CalendarBlank size={32} />
          <Heading as="h2" size="lg" mb={0}>
            {t("submissionInbox.projectDetail.meetings")}
          </Heading>
        </HStack>
        <Text color="text.secondary">{t("submissionInbox.comingSoon")}</Text>
      </Box>
    </Flex>
  )
}
