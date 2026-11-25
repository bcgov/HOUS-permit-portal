import { HStack, Text } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { RELEASE_NOTE_TYPE_CONFIG } from "../../../constants/release-note-type-config"
import { EReleaseNoteType } from "../../../types/enums"

type ReleaseNoteTypeBadgeProps = Readonly<{
  releaseType: EReleaseNoteType
}>

export function ReleaseNoteTypeBadge({ releaseType }: ReleaseNoteTypeBadgeProps) {
  const { t } = useTranslation()
  const { bg, color, Icon } = RELEASE_NOTE_TYPE_CONFIG[releaseType].badge

  return (
    <HStack
      as="span"
      spacing={1}
      display="inline-flex"
      alignItems="center"
      px={2}
      py={1}
      borderRadius="full"
      bg={bg}
      color={color}
      fontSize="xs"
      fontWeight="bold"
    >
      <Icon size={14} weight="bold" />
      <Text as="span" m={0}>
        {t(`releaseNote.types.${releaseType}`)}
      </Text>
    </HStack>
  )
}
