import { HStack, Tag, Text } from "@chakra-ui/react"
import { CubeFocus } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { colors } from "../../../styles/theme/foundations/colors"
import { ETemplateVersionStatus } from "../../../types/enums"

interface IExternalApiKeySandboxTagProps {
  statusScope: ETemplateVersionStatus
}

export const ExternalApiKeySandboxTag = ({ statusScope }: IExternalApiKeySandboxTagProps) => {
  const { t } = useTranslation()
  return (
    <Tag
      p={1}
      pr={2}
      borderRadius="sm"
      border="1px solid"
      bg="background.sandboxBase"
      bgImage={`repeating-linear-gradient(
        45deg,
        ${colors.background.sandboxStripe} 5px,
        ${colors.background.sandboxStripe} 10px,
        rgba(0, 0, 0, 0) 10px,
        rgba(0, 0, 0, 0) 20px
      )`}
      textTransform="capitalize"
      fontWeight="bold"
    >
      <HStack>
        <CubeFocus />
        {statusScope}
        <Text>{t(`requirementTemplate.status.${statusScope}`)}</Text>
      </HStack>
    </Tag>
  )
}
