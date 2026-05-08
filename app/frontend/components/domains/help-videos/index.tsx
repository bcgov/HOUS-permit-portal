import { Box, Container, Heading, LinkBox, LinkOverlay, SimpleGrid, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { SharedSpinner } from "../../shared/base/shared-spinner"

export const HelpVideosIndexScreen = observer(function HelpVideosIndexScreen() {
  const { helpVideoStore } = useMst()
  const { helpVideoSections, fetchHelpVideoSections, isLoadingHelpVideoSections } = helpVideoStore
  const { t } = useTranslation()

  useEffect(() => {
    fetchHelpVideoSections()
  }, [])

  return (
    <Container maxW="container.lg" py={12} as="main">
      <VStack align="stretch" spacing={8}>
        <Box>
          <Heading as="h1">{t("helpVideos.index.title")}</Heading>
          <Text mt={3} color="text.secondary">
            {t("helpVideos.index.description")}
          </Text>
        </Box>

        {isLoadingHelpVideoSections ? (
          <SharedSpinner />
        ) : (
          helpVideoSections.map((section) => (
            <Box key={section.id}>
              <Heading as="h2" size="lg">
                {section.title}
              </Heading>
              {section.description && (
                <Text mt={2} color="text.secondary">
                  {section.description}
                </Text>
              )}
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mt={4}>
                {section.helpVideos.map((video) => (
                  <LinkBox
                    key={video.id}
                    border="1px solid"
                    borderColor="border.light"
                    borderRadius="md"
                    p={4}
                    bg="white"
                  >
                    <Heading as="h3" size="md">
                      <LinkOverlay as={RouterLink} to={`/videos/${video.id}`}>
                        {video.title}
                      </LinkOverlay>
                    </Heading>
                    {video.description && (
                      <Text mt={2} color="text.secondary">
                        {video.description}
                      </Text>
                    )}
                  </LinkBox>
                ))}
              </SimpleGrid>
            </Box>
          ))
        )}
      </VStack>
    </Container>
  )
})
