import {
  Box,
  Button,
  Collapse,
  Flex,
  Heading,
  Link,
  ListItem,
  OrderedList,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { CaretDown, CaretUp, WarningCircle } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { IRequirementTemplateConfigError } from "../../../stores/requirement-template-store"

interface IConfigErrorsPanelProps {
  errors: IRequirementTemplateConfigError[]
  requirementTemplateId: string
}

export const ConfigErrorsPanel = ({ errors, requirementTemplateId }: IConfigErrorsPanelProps) => {
  const { t } = useTranslation()
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true })

  if (errors.length === 0) return null

  return (
    <Box
      bgColor="semantic.errorLight"
      borderColor="semantic.error"
      borderWidth="1px"
      borderRadius="lg"
      maxH="calc(100vh - 360px)"
      maxW="340px"
      position="fixed"
      right="6"
      top="220px"
      zIndex={14}
      p={4}
      overflowY="auto"
    >
      <Flex align="center" gap={4}>
        <Box color="semantic.error">
          <WarningCircle size={24} aria-label={t("requirementTemplate.edit.configErrors.warningIcon")} />
        </Box>
        <Heading as="h4" mb="0" overflowWrap="break-word">
          {t("requirementTemplate.edit.configErrors.title", { count: errors.length })}
        </Heading>
        <Button
          onClick={onToggle}
          rightIcon={isOpen ? <CaretUp /> : <CaretDown />}
          variant="unstyled"
          size="sm"
          aria-label={t("requirementTemplate.edit.configErrors.toggle")}
        />
      </Flex>
      <Collapse in={isOpen}>
        <Text fontSize="sm" mt="2">
          {t("requirementTemplate.edit.configErrors.instructions")}
        </Text>
        <OrderedList mt="2" ml="5" fontSize="sm">
          {errors.map((error) => {
            const fieldName = error.requirementName ?? error.requirementCode
            const label = fieldName
              ? t("requirementTemplate.edit.configErrors.fieldError", {
                  blockName: error.blockName,
                  fieldName,
                  message: error.message,
                })
              : t("requirementTemplate.edit.configErrors.blockError", {
                  blockName: error.blockName,
                  message: error.message,
                })

            return (
              <ListItem key={`${error.category}-${error.blockId}-${error.requirementCode ?? ""}-${error.message}`}>
                <Link
                  as={RouterLink}
                  color="text.primary"
                  textDecoration="underline"
                  to={builderPath(requirementTemplateId, error)}
                >
                  {label}
                </Link>
              </ListItem>
            )
          })}
        </OrderedList>
      </Collapse>
    </Box>
  )
}

function builderPath(requirementTemplateId: string, error: IRequirementTemplateConfigError) {
  const searchParams = new URLSearchParams({ openRequirementBlockId: error.blockId })
  if (error.requirementCode) searchParams.set("openRequirementCode", error.requirementCode)

  return `/requirement-templates/${requirementTemplateId}/edit?${searchParams}`
}
