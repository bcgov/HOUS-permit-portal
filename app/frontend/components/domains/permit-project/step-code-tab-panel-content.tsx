import { Container, Flex, Heading, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useSearch } from "../../../hooks/use-search"
import { useMst } from "../../../setup/root"
import { StepCodesGrid } from "./step-codes-grid"

export const StepCodeTabPanelContent = observer(() => {
  const { t } = useTranslation()
  const { stepCodeStore } = useMst()

  useSearch(stepCodeStore, [])

  return (
    <Flex direction="column" flex={1} bg="greys.white" pb={24} overflowY="auto" h={"full"}>
      <Container maxW="container.xl" py={8} h={"full"}>
        <VStack spacing={6} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading as="h1">{t("stepCode.index.title", "Step Codes")}</Heading>
          </Flex>
          <StepCodesGrid />
        </VStack>
      </Container>
    </Flex>
  )
})
