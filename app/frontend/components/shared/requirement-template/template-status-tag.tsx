import { Flex, HStack, Tag, Text } from "@chakra-ui/react"
import { CheckSquareOffset, Clock, Pencil } from "@phosphor-icons/react"
import { format } from "date-fns"
import React, { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { ETemplateVersionStatus } from "../../../types/enums"

interface ITemplateStatusTagProps {
  status: ETemplateVersionStatus
  scheduledFor?: Date
}

const statusColors: { [key in ETemplateVersionStatus]: string } = {
  [ETemplateVersionStatus.published]: "semantic.infoLight",
  [ETemplateVersionStatus.scheduled]: "semantic.successLight",
  [ETemplateVersionStatus.draft]: "semantic.warningLight",
  [ETemplateVersionStatus.deprecated]: "semantic.errorLight",
}

const statusBorderColors: { [key in ETemplateVersionStatus]: string } = {
  [ETemplateVersionStatus.published]: "semantic.info",
  [ETemplateVersionStatus.scheduled]: "semantic.success",
  [ETemplateVersionStatus.draft]: "semantic.warning",
  [ETemplateVersionStatus.deprecated]: "semantic.error",
}

const statusIcons: { [key in ETemplateVersionStatus]: ReactNode } = {
  [ETemplateVersionStatus.published]: <CheckSquareOffset />,
  [ETemplateVersionStatus.scheduled]: <Clock />,
  [ETemplateVersionStatus.draft]: <Pencil />,
  [ETemplateVersionStatus.deprecated]: <></>,
}

export const TemplateStatusTag = ({ status, scheduledFor }: ITemplateStatusTagProps) => {
  const color = statusColors[status]
  const borderColor = statusBorderColors[status]
  const { t } = useTranslation()
  return (
    <Flex direction="column">
      <Tag
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
      </Tag>
      {scheduledFor && (
        <Text fontSize="sm" fontWeight="bold">
          {format(scheduledFor, "yyyy-MM-dd")}
        </Text>
      )}
    </Flex>
  )
}
