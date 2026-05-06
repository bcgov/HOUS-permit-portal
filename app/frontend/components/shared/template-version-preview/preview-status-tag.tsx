import { Tag, Text, VStack } from "@chakra-ui/react"
import { format } from "date-fns"
import React from "react"
import { useTranslation } from "react-i18next"
import { ITemplateVersionPreview } from "../../../models/template-version-preview"
import { EPreviewStatus } from "../../../types/enums"

interface PreviewStatusTagProps {
  templateVersionPreview: ITemplateVersionPreview
}

const statusColorMap: Record<EPreviewStatus, { bg: string; border: string }> = {
  [EPreviewStatus.invited]: { bg: "greys.grey03", border: "border.dark" },
  [EPreviewStatus.access]: { bg: "semantic.successLight", border: "semantic.success" },
  [EPreviewStatus.expired]: { bg: "semantic.errorLight", border: "semantic.error" },
  [EPreviewStatus.revoked]: { bg: "semantic.errorLight", border: "semantic.error" },
}

const statusDateMap: Record<EPreviewStatus, keyof ITemplateVersionPreview> = {
  [EPreviewStatus.invited]: "createdAt",
  [EPreviewStatus.access]: "expiresAt",
  [EPreviewStatus.expired]: "expiresAt",
  [EPreviewStatus.revoked]: "discardedAt",
}

const PreviewStatusTag: React.FC<PreviewStatusTagProps> = ({ templateVersionPreview }) => {
  const { t } = useTranslation()

  const { status } = templateVersionPreview
  const colors = statusColorMap[status]

  const dateToDisplay = templateVersionPreview[statusDateMap[status]]

  const formattedDate = format(dateToDisplay, "MMM dd")

  return (
    <Tag.Root
      size="md"
      borderRadius="0"
      variant="solid"
      bg={colors.bg}
      border="1px solid"
      borderColor={colors.border}
      color="text.primary"
      textTransform="uppercase"
    >
      <VStack gap={1}>
        <Tag.Label fontWeight="bold">{status}</Tag.Label>
        <Text fontSize="xs">
          {status === EPreviewStatus.access && `${t("ui.until")} `}
          {formattedDate}
        </Text>
      </VStack>
    </Tag.Root>
  )
}

export default PreviewStatusTag
