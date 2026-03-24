import { Box, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { EProjectState } from "../../../../types/enums"

const KANBAN_COLUMNS: EProjectState[] = [
  EProjectState.queued,
  EProjectState.inProgress,
  EProjectState.ready,
  EProjectState.permitIssued,
  EProjectState.active,
  EProjectState.complete,
]

export const ProjectKanbanBoard = observer(function ProjectKanbanBoard() {
  const { t } = useTranslation()

  return (
    <Flex w="full" overflowX="auto" gap={4} p={4} minH="400px">
      {KANBAN_COLUMNS.map((status) => (
        <VStack key={status} minW="220px" flex="1" bg="greys.grey03" borderRadius="lg" p={3} align="stretch">
          <Heading size="xs" textTransform="uppercase" color="text.secondary" mb={2}>
            {/* @ts-ignore */}
            {t(`submissionInbox.projectStatuses.${status}`)}
          </Heading>
          <Box flex="1" minH="200px">
            <Text fontSize="sm" color="text.secondary" textAlign="center" mt={8}>
              {t("submissionInbox.columnsViewComingSoon")}
            </Text>
          </Box>
        </VStack>
      ))}
    </Flex>
  )
})
