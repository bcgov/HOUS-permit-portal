import { Button, Flex, HStack, Stack, Tag, Text } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitClassification } from "../../../../models/permit-classification"
import { ConfirmationModal } from "../../../shared/confirmation-modal"

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
          <Tag size="sm" variant={classification.enabled ? "success" : "error"}>
            {classification.enabled ? t("ui.enabled") : t("ui.disabled")}
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
        <ConfirmationModal
          renderTriggerButton={(props) => (
            <Button variant="secondary" size="sm" {...props}>
              {t("ui.delete")}
            </Button>
          )}
          title={t("ui.delete")}
          body={t("ui.deleteConfirm", {
            defaultValue: `Are you sure you want to delete "${classification.name}"? This cannot be undone.`,
          })}
          onConfirm={async (close) => {
            await onDelete()
            close()
          }}
          confirmButtonProps={{ variant: "primary" }}
        />
      </HStack>
    </Flex>
  )
}
