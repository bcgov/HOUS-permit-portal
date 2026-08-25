import { Box, Button, Container, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus } from "../../../types/enums"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { RouterLink } from "../../shared/navigation/router-link"

export const InfoDocumentsIndexScreen = observer(function InfoDocumentsIndexScreen() {
  const { infoDocumentStore, siteConfigurationStore } = useMst()
  const { infoDocuments, fetchInfoDocuments, isLoadingInfoDocuments } = infoDocumentStore
  const { infoDocumentsIntroText } = siteConfigurationStore
  const { t } = useTranslation()
  const translate = t as any
  const [hasFetched, setHasFetched] = useState(false)
  const [fetchFailed, setFetchFailed] = useState(false)

  useEffect(() => {
    fetchInfoDocuments(true).then((ok) => {
      setFetchFailed(!ok)
      setHasFetched(true)
    })
  }, [])

  const introText = infoDocumentsIntroText?.trim() || translate("infoDocuments.management.introDefault")
  const isLoading = !hasFetched || isLoadingInfoDocuments

  return (
    <Container maxW="container.lg" py={12} as="main">
      <VStack align="stretch" spacing={10}>
        <Box>
          <Heading as="h1" fontSize="3xl" mb={5}>
            {translate("infoDocuments.index.title")}
          </Heading>
          <Text color="text.secondary" fontSize="lg" whiteSpace="pre-wrap">
            {introText}
          </Text>
        </Box>

        {isLoading ? (
          <SharedSpinner />
        ) : fetchFailed ? (
          <CustomMessageBox
            status={EFlashMessageStatus.error}
            title={translate("infoDocuments.index.errorTitle")}
            description={translate("infoDocuments.index.errorBody")}
          >
            <Button variant="link" onClick={() => window.location.reload()}>
              {translate("infoDocuments.index.reload")}
            </Button>
          </CustomMessageBox>
        ) : infoDocuments.length === 0 ? (
          <Box bg="greys.grey10" border="1px solid" borderColor="border.light" borderRadius="md" py={12} px={8}>
            <VStack spacing={3}>
              <Text fontWeight="bold" fontSize="lg">
                {translate("infoDocuments.index.emptyTitle")}
              </Text>
              <Text color="text.secondary" textAlign="center" maxW="560px">
                {translate("infoDocuments.index.emptyBody")}
              </Text>
              <RouterLink to="/contact" color="text.link" fontWeight="bold">
                {t("site.contact")}
              </RouterLink>
            </VStack>
          </Box>
        ) : (
          <SimpleGrid
            columns={{ base: 1, md: 2 }}
            spacing={5}
            as="section"
            aria-label={translate("infoDocuments.index.documentList")}
          />
        )}
      </VStack>
    </Container>
  )
})
