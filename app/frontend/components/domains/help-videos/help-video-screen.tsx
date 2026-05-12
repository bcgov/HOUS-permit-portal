import { Box, Button, Container, Flex, Heading, HStack, Link, Text, VStack } from "@chakra-ui/react"
import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useHelpVideo } from "../../../hooks/resources/use-help-video"
import { IHelpVideo } from "../../../models/help-video"
import { useMst } from "../../../setup/root"
import { IHelpVideoNavigationNeighbor } from "../../../types/types"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { SafeTipTapDisplay } from "../../shared/editor/safe-tiptap-display"
import { RouterLink } from "../../shared/navigation/router-link"

export const HelpVideoScreen = observer(function HelpVideoScreen() {
  const { currentHelpVideo, error } = useHelpVideo()
  const { userStore } = useMst()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const backPath = userStore.currentUser?.isSuperAdmin ? "/configuration-management/help-videos" : "/videos"

  if (error) {
    return (
      <Container maxW="container.lg" py={12} as="main">
        <Heading as="h1">{t("helpVideos.show.errorTitle")}</Heading>
        <Text mt={3}>{error.message}</Text>
      </Container>
    )
  }

  if (!currentHelpVideo) {
    return <SharedSpinner />
  }

  const previousVideo = currentHelpVideo.previousHelpVideo
  const nextVideo = currentHelpVideo.nextHelpVideo

  const showSectionNav = previousVideo != null || nextVideo != null

  return (
    <Container maxW="container.lg" py={12} as="main">
      <VStack align="stretch" spacing={6}>
        <Button
          onClick={() => navigate(backPath)}
          variant="link"
          alignSelf="flex-start"
          leftIcon={<CaretLeft size={20} />}
          textDecoration="none"
        >
          {t("ui.back")}
        </Button>
        <Heading as="h1">{currentHelpVideo.title}</Heading>
        {currentHelpVideo.description && (
          <Text color="text.secondary" maxW="720px">
            {currentHelpVideo.description}
          </Text>
        )}
        {currentHelpVideo.videoUrl && (
          <video controls width="100%">
            <source src={currentHelpVideo.videoUrl} type="video/mp4" />
            {currentHelpVideo.captionUrl && (
              <track
                kind="captions"
                src={currentHelpVideo.captionUrl}
                srcLang="en"
                label={t("helpVideos.show.englishCaptions")}
                default
              />
            )}
          </video>
        )}
        {currentHelpVideo.aboutHtml && (
          <VStack align="stretch" spacing={4}>
            <Heading as="h2" variant="yellowline">
              {t("helpVideos.show.about")}
            </Heading>
            <SafeTipTapDisplay htmlContent={currentHelpVideo.aboutHtml} />
          </VStack>
        )}
        {currentHelpVideo.transcriptUrl && (
          <VStack align="stretch" spacing={3}>
            <Heading as="h2" variant="yellowline">
              {t("helpVideos.show.relatedResources")}
            </Heading>
            <Link href={currentHelpVideo.transcriptUrl} color="text.link" target="_blank" rel="noopener noreferrer">
              {transcriptLabel(currentHelpVideo, t("helpVideos.show.transcript"))}
            </Link>
          </VStack>
        )}

        {showSectionNav && (
          <Flex gap={4} w="full" pt={6} mt={2} align="stretch">
            <Box flex={1} minW={0}>
              {previousVideo && (
                <RouterLink
                  to={helpVideoPath(previousVideo)}
                  display="block"
                  border="1px solid"
                  borderColor="border.base"
                  bg="white"
                  p={4}
                  borderRadius="md"
                  textDecoration="none"
                  transition="border-color 0.2s ease"
                  _hover={{ borderColor: "text.link" }}
                  aria-label={t("helpVideos.show.previousVideoAria", { title: previousVideo.title })}
                >
                  <Flex direction="column" align="flex-start" gap={2}>
                    <HStack spacing={1} color="text.link" fontSize="sm" fontWeight="medium">
                      <CaretLeft size={16} aria-hidden />
                      <Text as="span">{t("helpVideos.show.previousVideo")}</Text>
                    </HStack>
                    <Text fontSize="md" fontWeight="bold" color="text.link" lineHeight="short" noOfLines={3}>
                      {previousVideo.title}
                    </Text>
                  </Flex>
                </RouterLink>
              )}
            </Box>
            <Box flex={1} minW={0}>
              {nextVideo && (
                <RouterLink
                  to={helpVideoPath(nextVideo)}
                  display="block"
                  border="1px solid"
                  borderColor="border.base"
                  bg="white"
                  p={4}
                  borderRadius="md"
                  textDecoration="none"
                  transition="border-color 0.2s ease"
                  _hover={{ borderColor: "text.link" }}
                  aria-label={t("helpVideos.show.nextVideoAria", { title: nextVideo.title })}
                >
                  <Flex direction="column" align="flex-end" gap={2} textAlign="right">
                    <HStack spacing={1} color="text.link" fontSize="sm" fontWeight="medium">
                      <Text as="span">{t("helpVideos.show.nextVideo")}</Text>
                      <CaretRight size={16} aria-hidden />
                    </HStack>
                    <Text fontSize="md" fontWeight="bold" color="text.link" lineHeight="short" noOfLines={3} w="full">
                      {nextVideo.title}
                    </Text>
                  </Flex>
                </RouterLink>
              )}
            </Box>
          </Flex>
        )}
      </VStack>
    </Container>
  )
})

const transcriptLabel = (video: IHelpVideo, label: string) => {
  const file = video.transcriptDocument?.file
  const filename = file?.metadata?.filename
  const extension = filename?.split(".").pop()?.toUpperCase()
  const size = formatFileSize(file?.metadata?.size)
  const details = [extension, size].filter(Boolean).join(", ")

  return details ? `${label} (${details})` : label
}

const formatFileSize = (size?: number) => {
  if (!size) return null

  const megabytes = size / 1024 / 1024
  if (megabytes >= 1) return `${megabytes.toFixed(1)} MB`

  const kilobytes = size / 1024
  return `${Math.round(kilobytes)} KB`
}

const helpVideoPath = (video: IHelpVideoNavigationNeighbor) => `/videos/${video.slug ?? video.id}`
