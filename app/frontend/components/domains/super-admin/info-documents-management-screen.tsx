import { Button, Container, Heading, VStack } from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

export const InfoDocumentsManagementScreen = observer(function InfoDocumentsManagementScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Container maxW="container.lg" py={8} as="main">
      <VStack align="stretch" spacing={6}>
        <Button
          onClick={() => navigate(-1)}
          variant="link"
          alignSelf="flex-start"
          leftIcon={<CaretLeft size={20} />}
          textDecoration="none"
        >
          {t("ui.back")}
        </Button>
        <Heading as="h1" fontSize="3xl">
          {t("infoDocuments.management.title")}
        </Heading>
      </VStack>
    </Container>
  )
})
