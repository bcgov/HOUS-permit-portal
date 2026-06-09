import { Box, Flex, Heading, Link, VStack } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IReleaseNote } from "../../../models/release-note-model"
import { useMst } from "../../../setup/root"
import { CopyLinkButton } from "../../shared/base/copy-link-button"
import { SafeTipTapDisplay } from "../../shared/editor/safe-tiptap-display"
import { ReleaseNoteVersionBadge } from "./release-note-version-badge"

type ReleaseNoteEntryProps = {
  releaseNote: IReleaseNote
  isHighlighted?: boolean
}

export const ReleaseNoteEntry = observer(function ReleaseNoteEntry({
  releaseNote,
  isHighlighted = false,
}: ReleaseNoteEntryProps) {
  const { t } = useTranslation()
  const { releaseNoteStore } = useMst()
  const { getReleaseNoteAnchorId, getReleaseNoteShareUrl } = releaseNoteStore

  return (
    <VStack id={getReleaseNoteAnchorId(releaseNote.id)} align="stretch" spacing={10} w="full" scrollMarginTop={8}>
      <Flex
        align="center"
        gap={4}
        flexWrap="wrap"
        w="full"
        bg={isHighlighted ? "theme.yellowLight" : "transparent"}
        borderRadius="sm"
        transition="background-color 500ms ease"
      >
        <Heading as="h2" fontSize="2xl" m={0}>
          {format(releaseNote.releaseDate, "MMMM d, yyyy")}
        </Heading>
        <ReleaseNoteVersionBadge version={releaseNote.version} />
        <CopyLinkButton
          value={getReleaseNoteShareUrl(releaseNote.id)}
          iconOnly
          aria-label={t("releaseNote.viewing.copyReleaseNoteLink")}
        />
      </Flex>

      {releaseNote.content && (
        <Box>
          <Heading as="h3" variant="yellowline" fontSize="xl" mb={2} mt={0}>
            {t("releaseNote.viewing.whatsNew")}
          </Heading>
          <SafeTipTapDisplay
            htmlContent={releaseNote.content}
            fontSize="lg"
            lineHeight="1.68"
            sx={{
              "& a": {
                color: "text.link",
                textDecoration: "underline",
              },
            }}
          />
          {releaseNote.releaseNotesUrl && (
            <Link
              href={releaseNote.releaseNotesUrl}
              isExternal
              color="text.link"
              fontSize="lg"
              lineHeight="1.68"
              textDecoration="underline"
              display="inline-block"
              mt={4}
            >
              {t("releaseNote.viewing.githubLink")}
            </Link>
          )}
        </Box>
      )}

      {releaseNote.issues && (
        <Box>
          <Heading as="h3" fontSize="xl" mb={2} mt={0}>
            {t("releaseNote.viewing.issues")}
          </Heading>
          <SafeTipTapDisplay htmlContent={releaseNote.issues} fontSize="lg" lineHeight="1.68" />
        </Box>
      )}
    </VStack>
  )
})
