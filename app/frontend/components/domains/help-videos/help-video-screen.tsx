import { Button, Container, Heading, Link, Text, VStack } from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useHelpVideo } from "../../../hooks/resources/use-help-video"
import { IHelpVideo } from "../../../models/help-video"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { SafeTipTapDisplay } from "../../shared/editor/safe-tiptap-display"

export const HelpVideoScreen = observer(function HelpVideoScreen() {
  const { currentHelpVideo, error } = useHelpVideo()
  const { t } = useTranslation()
  const navigate = useNavigate()

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
        <Button
          onClick={() => navigate(-1)}
          variant="link"
          alignSelf="flex-start"
          leftIcon={<CaretLeft size={20} />}
          textDecoration="none"
        >
          {t("ui.back")}
        </Button>
        <Heading as="h1">{currentHelpVideo.title}</Heading>
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
        {currentHelpVideo.descriptionHtml && (
          <VStack align="stretch" spacing={4}>
            <Heading as="h2" variant="yellowline">
              {t("helpVideos.show.about")}
            </Heading>
            <SafeTipTapDisplay htmlContent={currentHelpVideo.descriptionHtml} />
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
