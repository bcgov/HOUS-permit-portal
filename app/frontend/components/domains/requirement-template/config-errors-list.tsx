import { Box, Link, ListItem, OrderedList, Text } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { IRequirementTemplateConfigError } from "../../../types/types"

interface IConfigErrorsListProps {
  errors: IRequirementTemplateConfigError[]
  requirementTemplateId: string
  onNavigate?: () => void
}

export const ConfigErrorsList = ({ errors, requirementTemplateId, onNavigate }: IConfigErrorsListProps) => {
  const { t } = useTranslation()

  if (errors.length === 0) return null

  return (
    <Box bgColor="semantic.errorLight" borderColor="semantic.error" borderWidth="1px" borderRadius="md" p={3} mt={4}>
      <Text fontSize="sm" fontWeight="bold">
        {t("requirementTemplate.edit.configErrors.title", { count: errors.length })}
      </Text>
      <Text fontSize="sm" mt="1">
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
                onClick={onNavigate}
              >
                {label}
              </Link>
            </ListItem>
          )
        })}
      </OrderedList>
    </Box>
  )
}

function builderPath(requirementTemplateId: string, error: IRequirementTemplateConfigError) {
  const searchParams = new URLSearchParams({ openRequirementBlockId: error.blockId })
  if (error.requirementCode) searchParams.set("openRequirementCode", error.requirementCode)

  return `/requirement-templates/${requirementTemplateId}/edit?${searchParams}`
}
