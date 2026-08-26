import { Box, Button, Container, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus } from "../../../types/enums"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { RouterLink } from "../../shared/navigation/router-link"
import { FilterPills } from "./filter-pills"
import { InfoDocumentCard } from "./info-document-card"

export const InfoDocumentsIndexScreen = observer(function InfoDocumentsIndexScreen() {
  const { infoDocumentStore, siteConfigurationStore } = useMst()
  const { infoDocuments, fetchInfoDocuments, isLoadingInfoDocuments } = infoDocumentStore
  const { infoDocumentsIntroText } = siteConfigurationStore
  const { t } = useTranslation()
  const translate = t as any
  const [searchParams, setSearchParams] = useSearchParams()
  const [hasFetched, setHasFetched] = useState(false)
  const [fetchFailed, setFetchFailed] = useState(false)
  const topicParam = searchParams.get("topic")

  const loadDocuments = () => {
    fetchInfoDocuments(true).then((ok) => {
      setFetchFailed(!ok)
      setHasFetched(true)
    })
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  const topics = Array.from(new Set(infoDocuments.flatMap((document) => Array.from(document.topics)))).sort((a, b) =>
    a.localeCompare(b)
  )
  const selectedTopic = topicParam && topics.includes(topicParam) ? topicParam : null
  const visibleDocuments = selectedTopic
    ? infoDocuments.filter((document) => document.topics.includes(selectedTopic))
    : infoDocuments

  const setSelectedTopic = (topic: string | null) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (topic) next.set("topic", topic)
        else next.delete("topic")
        return next
      },
      { replace: true }
    )
  }

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
            <Button variant="link" onClick={loadDocuments}>
              {translate("infoDocuments.index.retry")}
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
          <VStack align="stretch" spacing={10}>
            {topics.length > 0 && (
              <FilterPills
                label={translate("infoDocuments.index.filterByTopic")}
                value={selectedTopic}
                options={topics}
                allLabel={translate("infoDocuments.index.allTopics")}
                onChange={setSelectedTopic}
              />
            )}
            <Text color="text.secondary">
              {translate("infoDocuments.index.showingCount", {
                shown: visibleDocuments.length,
                total: infoDocuments.length,
              })}
            </Text>
            <SimpleGrid
              columns={{ base: 1, md: 2 }}
              spacing={5}
              as="section"
              aria-label={translate("infoDocuments.index.documentList")}
            >
              {visibleDocuments.map((document) => (
                <InfoDocumentCard key={document.id} document={document} />
              ))}
            </SimpleGrid>
          </VStack>
        )}
      </VStack>
    </Container>
  )
})
