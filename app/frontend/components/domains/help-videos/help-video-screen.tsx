import { Button, Container, Heading, Link, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { useHelpVideo } from "../../../hooks/resources/use-help-video"
import { SharedSpinner } from "../../shared/base/shared-spinner"

export const HelpVideoScreen = observer(function HelpVideoScreen() {
  const { currentHelpVideo, error } = useHelpVideo()
  const { t } = useTranslation()

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

  return (
    <Container maxW="container.lg" py={12} as="main">
      <VStack align="stretch" spacing={6}>
        <Button as={RouterLink} to="/videos" variant="secondary" alignSelf="flex-start">
          {t("helpVideos.show.backToVideos")}
        </Button>
        <Heading as="h1">{currentHelpVideo.title}</Heading>
        {currentHelpVideo.description && <Text color="text.secondary">{currentHelpVideo.description}</Text>}
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
        {currentHelpVideo.transcriptUrl && (
          <Link href={currentHelpVideo.transcriptUrl} color="text.link" target="_blank" rel="noopener noreferrer">
            {t("helpVideos.show.downloadTranscript")}
          </Link>
        )}
      </VStack>
    </Container>
  )
})
