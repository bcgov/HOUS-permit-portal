import { Box, Container, Heading, Link, LinkBox, LinkOverlay, SimpleGrid, Text, VStack } from "@chakra-ui/react"
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
  const translate = t as any

  useEffect(() => {
    fetchHelpVideoSections()
  }, [])

  const sectionsWithVideos = helpVideoSections.filter((section) => section.helpVideos.length > 0)

  return (
    <Container maxW="container.lg" py={12} as="main">
      <VStack align="stretch" spacing={10}>
        <Box>
          <Heading as="h1" fontSize="3xl" mb={5}>
            {translate("helpVideos.index.title")}
          </Heading>
          <Text maxW="640px">{translate("helpVideos.index.description")}</Text>
        </Box>

        {isLoadingHelpVideoSections ? (
          <SharedSpinner />
        ) : (
          <>
            <Box>
              <SectionAccent />
              <Heading as="h2" fontSize="xl" mb={4}>
                {translate("helpVideos.index.onThisPage")}
              </Heading>
              <VStack align="flex-start" spacing={3}>
                {sectionsWithVideos.map((section) => (
                  <Link key={section.id} href={`#${sectionAnchorId(section.id)}`} color="text.link">
                    {section.title}
                  </Link>
                ))}
              </VStack>
            </Box>

            {sectionsWithVideos.map((section) => (
              <Box key={section.id} id={sectionAnchorId(section.id)} scrollMarginTop={8}>
                <SectionAccent />
                <Heading as="h2" fontSize="xl" mb={5}>
                  {section.title}
                </Heading>
                {section.description && (
                  <Text mb={5} color="text.secondary" maxW="640px">
                    {section.description}
                  </Text>
                )}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                  {section.helpVideos.map((video) => (
                    <LinkBox
                      key={video.id}
                      border="1px solid"
                      borderColor="border.base"
                      minH="150px"
                      p={5}
                      bg="white"
                      transition="border-color 0.2s ease"
                      _hover={{ borderColor: "text.link" }}
                    >
                      <Heading as="h3" fontSize="md" mb={5}>
                        <LinkOverlay as={RouterLink} to={`/videos/${video.slug ?? video.id}`} color="text.link">
                          {video.title}
                        </LinkOverlay>
                      </Heading>
                      {video.description && (
                        <Text fontSize="sm" color="text.secondary" lineHeight="short">
                          {video.description}
                        </Text>
                      )}
                    </LinkBox>
                  ))}
                </SimpleGrid>
              </Box>
            ))}
          </>
        )}
      </VStack>
    </Container>
  )
})

const sectionAnchorId = (id: string) => `help-video-section-${id}`

const SectionAccent = () => <Box w={8} h="3px" bg="semantic.warning" mb={3} />
