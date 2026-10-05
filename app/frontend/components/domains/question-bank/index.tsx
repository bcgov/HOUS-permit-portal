import { Box, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { ToggleArchivedButton } from "../../shared/buttons/toggle-archived-button"
import { QuestionBankModal } from "./question-bank-modal"
import { QuestionsTable } from "./questions-table"

export const QuestionBankScreen = observer(function QuestionBankScreen() {
  const { t } = useTranslation()
  const { requirementQuestionStore } = useMst()

  return (
    <Container maxW="container.lg" p={8} as="main">
      <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
        <Flex justifyContent={"space-between"} w={"full"} alignItems={"flex-end"} gap={6}>
          <Box>
            <Heading as="h1" color={"text.primary"}>
              {t("questionBank.index.title")}
            </Heading>
            <Text color={"text.secondary"} mt={1}>
              {t("questionBank.index.description")}
            </Text>
          </Box>
          <QuestionBankModal />
        </Flex>
        <QuestionsTable alignItems={"flex-start"} w={"full"} />
        <ToggleArchivedButton searchModel={requirementQuestionStore} mt={3} />
      </VStack>
    </Container>
  )
})
