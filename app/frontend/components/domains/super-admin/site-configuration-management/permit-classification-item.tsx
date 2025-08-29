import { Button, Flex, HStack, Stack, Tag, Text } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitClassification } from "../../../../models/permit-classification"

interface IProps {
  classification: IPermitClassification
  onEdit: () => void
  onDelete: () => void
}

export const PermitClassificationItem: React.FC<IProps> = ({ classification, onEdit, onDelete }) => {
  const { t } = useTranslation()

  return (
    <Flex
      border="1px solid"
      borderColor="border.light"
      p={4}
      borderRadius="lg"
      gap={4}
      align="center"
      _hover={{ boxShadow: "md", borderColor: "theme.blueLight", transform: "translateY(-1px)" }}
      transition="all 0.15s ease-in-out"
    >
      <Stack flex={1} spacing={2}>
        <HStack spacing={3} align="center">
          <Text fontWeight={700} fontSize="lg" color={classification.enabled ? "text.link" : "greys.grey90"}>
            {classification.name}
          </Text>
          <Tag size="sm" bg="greys.grey03" color="text.secondary">
            {classification.code}
          </Tag>
          {!!classification.categoryLabel && (
            <Tag size="sm" variant="subtle" color="text.secondary" bg="greys.grey03">
              {classification.categoryLabel}
            </Tag>
          )}
          <Tag size="sm" colorScheme={classification.enabled ? "green" : "gray"} variant="subtle">
            {classification.enabled ? "Enabled" : "Disabled"}
          </Tag>
        </HStack>
        {!!classification.description && (
          <Text color="text.secondary" fontSize="sm">
            {classification.description}
          </Text>
        )}
      </Stack>
      <HStack spacing={2}>
        <Button onClick={onEdit} size="sm" variant="primary">
          {t("ui.edit")}
        </Button>
        <Button variant="secondary" onClick={onDelete} size="sm">
          {t("ui.delete")}
        </Button>
      </HStack>
    </Flex>
  )
}
