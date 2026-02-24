import { Container, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"

export const OverheatingCodeTabPanelContent = observer(() => {
  const { t } = useTranslation()

  return (
    <Flex direction="column" flex={1} bg="greys.white" pb={24} overflowY="auto" h={"full"}>
      <Container maxW="container.xl" py={8} h={"full"}>
        <VStack spacing={3} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading as="h1">{t("overheatingCode.index.title", "Overheating Code Checks")}</Heading>
            <RouterLinkButton to="/overheating-codes/new" variant="primary" leftIcon={<Plus />}>
              {t("overheatingCode.startNew", "Start New Overheating Code Check")}
            </RouterLinkButton>
          </Flex>
          <Text fontSize="md" color="text.secondary" mb={4}>
            {t(
              "overheatingCode.index.intro",
              "Your overheating code check results are stored here. Use this service to verify compliance with overheating requirements before submitting a permit application."
            )}
          </Text>
        </VStack>
      </Container>
    </Flex>
  )
})
