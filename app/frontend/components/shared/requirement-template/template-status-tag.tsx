import { Flex, HStack, Tag, Text } from "@chakra-ui/react"
import { CheckSquareOffset, Clock, Pencil } from "@phosphor-icons/react"
import { format } from "date-fns"
import React, { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { ERequirementTemplateStatus } from "../../../types/enums"

interface ITemplateStatusTagProps {
  requirementTemplate
}

const statusColors: { [key in ERequirementTemplateStatus]: string } = {
  [ERequirementTemplateStatus.published]: "semantic.infoLight",
  [ERequirementTemplateStatus.scheduled]: "semantic.successLight",
  [ERequirementTemplateStatus.draft]: "semantic.warningLight",
}

const statusBorderColors: { [key in ERequirementTemplateStatus]: string } = {
  [ERequirementTemplateStatus.published]: "semantic.info",
  [ERequirementTemplateStatus.scheduled]: "semantic.success",
  [ERequirementTemplateStatus.draft]: "semantic.warning",
}

const statusIcons: { [key in ERequirementTemplateStatus]: ReactNode } = {
  [ERequirementTemplateStatus.published]: <CheckSquareOffset />,
  [ERequirementTemplateStatus.scheduled]: <Clock />,
  [ERequirementTemplateStatus.draft]: <Pencil />,
}

export const TemplateStatusTag = ({ requirementTemplate }: ITemplateStatusTagProps) => {
  const status = requirementTemplate.status as ERequirementTemplateStatus
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
      {requirementTemplate.scheduledFor && (
        <Text fontSize="sm" fontWeight="bold">
          {format(requirementTemplate.scheduledFor, "yyyy-MM-dd")}
        </Text>
      )}
    </Flex>
  )
}
