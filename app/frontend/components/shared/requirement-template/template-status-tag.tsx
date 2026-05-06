import { Flex, HStack, Tag, Text } from "@chakra-ui/react"
import { CheckSquareOffset, Clock, Pencil, TrashSimple, Wrench } from "@phosphor-icons/react"
import { format } from "date-fns"
import { utcToZonedTime } from "date-fns-tz"
import React, { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { vancouverTimeZone } from "../../../constants"
import { ETemplateVersionStatus } from "../../../types/enums"

// "builder" is a UI-only status representing the template builder editing state
// It is not a real TemplateVersion status, just a display variant
export type TTemplateStatusTagStatus = ETemplateVersionStatus | "builder"

interface ITemplateStatusTagProps {
  status: TTemplateStatusTagStatus
  scheduledFor?: Date
  subText?: string
}

const statusColors: Record<TTemplateStatusTagStatus, string> = {
  [ETemplateVersionStatus.published]: "semantic.infoLight",
  [ETemplateVersionStatus.scheduled]: "semantic.successLight",
  [ETemplateVersionStatus.draft]: "semantic.warningLight",
  [ETemplateVersionStatus.deprecated]: "semantic.errorLight",
  builder: "semantic.warningLight",
}

const statusBorderColors: Record<TTemplateStatusTagStatus, string> = {
  [ETemplateVersionStatus.published]: "semantic.info",
  [ETemplateVersionStatus.scheduled]: "semantic.success",
  [ETemplateVersionStatus.draft]: "semantic.warning",
  [ETemplateVersionStatus.deprecated]: "semantic.error",
  builder: "semantic.warning",
}

const statusIcons: Record<TTemplateStatusTagStatus, ReactNode> = {
  [ETemplateVersionStatus.published]: <CheckSquareOffset />,
  [ETemplateVersionStatus.scheduled]: <Clock />,
  [ETemplateVersionStatus.draft]: <Pencil />,
  [ETemplateVersionStatus.deprecated]: <TrashSimple />,
  builder: <Wrench />,
}

export const TemplateStatusTag = ({ status, scheduledFor, subText }: ITemplateStatusTagProps) => {
  const color = statusColors[status]
  const borderColor = statusBorderColors[status]
  const { t } = useTranslation()
  return (
    <Flex direction="column">
      <Tag.Root
        p={1}
        pr={2}
        borderRadius="sm"
        border="1px solid"
        borderColor={borderColor}
        backgroundColor={color}
        textTransform="capitalize"
      >
        <HStack>
          {statusIcons[status]}
          <Text>{t(`requirementTemplate.status.${status}`)}</Text>
        </HStack>
      </Tag.Root>
      {scheduledFor && (
        <Text fontSize="sm" fontWeight="bold">
          {format(utcToZonedTime(scheduledFor, vancouverTimeZone), "yyyy-MM-dd")}
        </Text>
      )}
      {subText && (
        <Text fontSize="sm" fontWeight="bold">
          {subText}
        </Text>
      )}
    </Flex>
  )
}
