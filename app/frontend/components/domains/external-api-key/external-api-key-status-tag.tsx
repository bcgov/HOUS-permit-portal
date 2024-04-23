import { HStack, Tag, Text } from "@chakra-ui/react"
import { Key, Prohibit } from "@phosphor-icons/react"
import React, { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { ExternalApiKeyStatus } from "../../../types/enums"

interface IExternalApiKeyStatusTagProps {
  status: ExternalApiKeyStatus
}

const statusColors: { [key in ExternalApiKeyStatus]: string } = {
  [ExternalApiKeyStatus.active]: "semantic.successLight",
  [ExternalApiKeyStatus.notActive]: "semantic.errorLight",
}

const statusBorderColors: { [key in ExternalApiKeyStatus]: string } = {
  [ExternalApiKeyStatus.active]: "semantic.success",
  [ExternalApiKeyStatus.notActive]: "semantic.error",
}

const statusIcons: { [key in ExternalApiKeyStatus]: ReactNode } = {
  [ExternalApiKeyStatus.active]: <Key />,
  [ExternalApiKeyStatus.notActive]: <Prohibit style={{ color: "var(--chakra-colors-semantic-error)" }} />,
}

export const ExternalApiKeyStatusTag = ({ status }: IExternalApiKeyStatusTagProps) => {
  const color = statusColors[status]
  const borderColor = statusBorderColors[status]
  const { t } = useTranslation()
  return (
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
        <Text>{t(`externalApiKey.status.${status}`)}</Text>
      </HStack>
    </Tag>
  )
}
