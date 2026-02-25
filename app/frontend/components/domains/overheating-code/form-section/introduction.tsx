import { Box, Flex, FormControl, FormErrorMessage, FormLabel, Heading, Input, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useOverheatingCode } from "../../../../hooks/resources/use-overheating-code"
import { useMst } from "../../../../setup/root"
import { FormFooter } from "./form-footer"

interface IIntroductionFormData {
  issuedTo: string
  projectNumber: string
}

export const Introduction = observer(function Introduction() {
  const { t } = useTranslation()
  const { currentOverheatingCode } = useOverheatingCode()
  const {
    overheatingCodeStore: { updateOverheatingCode },
  } = useMst()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IIntroductionFormData>({
    mode: "onChange",
    defaultValues: {
      issuedTo: currentOverheatingCode?.issuedTo || "",
      projectNumber: currentOverheatingCode?.projectNumber || "",
    },
  })

  const onSubmit = async (data: IIntroductionFormData) => {
    if (!currentOverheatingCode) return
    await updateOverheatingCode(currentOverheatingCode.id, {
      issuedTo: data.issuedTo,
      projectNumber: data.projectNumber,
    })
  }

  return (
    <Box>
      <Box bg="gray.800" color="white" px={6} py={4} borderRadius="md" mb={6}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
          <Box>
            <Heading as="h3" size="md" fontWeight="bold">
              {t("overheatingCode.sections.introduction.standardTitle", "CSA Standard F280-12 Compliance")}
            </Heading>
            <Text fontSize="sm" mt={1} color="gray.300">
              {t(
                "overheatingCode.sections.introduction.standardReferences",
                "BCBC 2024: 9.33.2.1.(2); 9.33.3.1.(2); 9.33.5.1.(1); 9.36.3.2.(1); 9.36.5.15.(5)"
              )}
            </Text>
          </Box>
          <Text fontSize="xs" color="gray.400" textAlign="right" whiteSpace="nowrap">
            {t("overheatingCode.sections.introduction.formVersion", "BC Single Zone Cooling Guide Ver 1.0")}
          </Text>
        </Flex>
      </Box>

      <Heading as="h2" size="lg" mb={2}>
        {t("overheatingCode.sections.introduction.title", "Overheating Code Check")}
      </Heading>
      <Text mb={6} color="text.secondary">
        {t(
          "overheatingCode.sections.introduction.description",
          "Provide basic project identification details to get started with your overheating code compliance check."
        )}
      </Text>

      <VStack spacing={6} align="stretch">
        <FormControl isInvalid={!!errors.issuedTo}>
          <FormLabel>
            {t("overheatingCode.sections.introduction.issuedToLabel", "These documents issued for the use of")}
          </FormLabel>
          <Input
            {...register("issuedTo", {
              required: t(
                "overheatingCode.sections.introduction.issuedToRequired",
                "Please enter who these documents are issued for"
              ),
            })}
            placeholder={t(
              "overheatingCode.sections.introduction.issuedToPlaceholder",
              "e.g. Jane Smith, ABC Construction Ltd."
            )}
          />
          <FormErrorMessage>{errors.issuedTo?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.projectNumber}>
          <FormLabel>{t("overheatingCode.sections.introduction.projectNumberLabel", "Project #")}</FormLabel>
          <Input
            {...register("projectNumber", {
              required: t(
                "overheatingCode.sections.introduction.projectNumberRequired",
                "Please enter a project number"
              ),
            })}
            placeholder={t("overheatingCode.sections.introduction.projectNumberPlaceholder", "e.g. 2026-001")}
          />
          <FormErrorMessage>{errors.projectNumber?.message}</FormErrorMessage>
        </FormControl>
      </VStack>

      <FormFooter<IIntroductionFormData> handleSubmit={handleSubmit} onSubmit={onSubmit} isLoading={isSubmitting} />
    </Box>
  )
})
