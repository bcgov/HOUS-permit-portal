import { Box, Flex, Heading, Text } from "@chakra-ui/react"
import { CalendarBlank } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"

export const MeetingsTabPanelContent = observer(() => {
  const { t } = useTranslation()

  return (
    <Flex direction="column" flex={1} bg="greys.white" p={10}>
      <Box as="section">
        <Flex align="center" gap={4} mb={6}>
          <CalendarBlank size={32} />
          <Heading as="h2" size="lg" mb={0}>
            {t("permitProject.meetings.tabTitle")}
          </Heading>
        </Flex>
        <Text color="text.secondary">{t("permitProject.meetings.tabDescription")}</Text>
      </Box>
    </Flex>
  )
})
