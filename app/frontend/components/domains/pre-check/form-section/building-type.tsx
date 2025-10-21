import { Box, Flex, Heading, Radio, Spacer, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { usePreCheck } from "../../../../hooks/resources/use-pre-check"
import { IPermitType } from "../../../../models/permit-classification"
import { useMst } from "../../../../setup/root"
import { EPermitClassificationCode } from "../../../../types/enums"
import { IOption } from "../../../../types/types"
import { Editor } from "../../../shared/editor/editor"
import { PreCheckBackLink } from "../pre-check-back-link"
import { FormFooter } from "./form-footer"

interface IBuildingTypeFormData {
  permitTypeId: string | null
}

export const BuildingType = observer(function BuildingType() {
  const { t } = useTranslation()
  const { currentPreCheck } = usePreCheck()
  const {
    preCheckStore: { updatePreCheck },
    permitClassificationStore,
  } = useMst()
  const [permitTypeOptions, setPermitTypeOptions] = useState<IOption<IPermitType>[]>([])
  const isFirstNation = currentPreCheck?.jurisdiction?.firstNation

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<IBuildingTypeFormData>({
    defaultValues: {
      permitTypeId: currentPreCheck?.permitType?.id || null,
    },
  })

  const selectedPermitTypeId = watch("permitTypeId")

  useEffect(() => {
    ;(async () => {
      // Fetch permit type options - show all, not hidden
      const options = await permitClassificationStore.fetchPermitTypeOptions(false, isFirstNation, null, null)
      // Filter to only show low residential options
      const filteredOptions = options.filter((option) => option.value.code === EPermitClassificationCode.lowResidential)
      setPermitTypeOptions(filteredOptions)

      // Pre-select the option if there's only one available and no current selection
      if (filteredOptions.length === 1 && !currentPreCheck?.permitType?.id) {
        const singleOption = filteredOptions[0]
        setValue("permitTypeId", singleOption.value.id)
      }
    })()
  }, [permitClassificationStore, isFirstNation, currentPreCheck?.permitType?.id, setValue])

  const onSubmit = async (data: IBuildingTypeFormData) => {
    if (!currentPreCheck) return
    await updatePreCheck(currentPreCheck.id, {
      permitTypeId: data.permitTypeId,
    })
  }

  return (
    <Box>
      <PreCheckBackLink />
      <Heading as="h2" size="lg" mb={4}>
        {t("preCheck.sections.buildingType.title", "Building Type")}
      </Heading>
      <Text mb={6}>
        {t("preCheck.sections.buildingType.description", "Choose the building type that best describes your project")}
        {". "}
        {t("preCheck.sections.buildingType.description2")}
      </Text>
      <Text mb={6}></Text>

      <VStack spacing={4} align="stretch" mb={8}>
        <Controller
          name="permitTypeId"
          control={control}
          rules={{ required: t("preCheck.sections.buildingType.required", "You must select a building type") }}
          render={({ field, fieldState }) => (
            <>
              <Flex gap={4} wrap="wrap">
                {permitTypeOptions.map((option) => {
                  const isSelected = selectedPermitTypeId === option.value.id
                  return (
                    <Box
                      key={option.value.id}
                      onClick={() => !currentPreCheck?.isSubmitted && field.onChange(option.value.id)}
                      borderRadius="lg"
                      p={6}
                      border="1px solid"
                      borderColor={isSelected ? "theme.blueAlt" : "border.light"}
                      bg="white"
                      w={{ base: "100%", md: "48%" }}
                      transition="all 0.2s ease-in-out"
                      _hover={!currentPreCheck?.isSubmitted ? { bg: "hover.blue" } : undefined}
                      cursor={currentPreCheck?.isSubmitted ? "not-allowed" : "pointer"}
                      opacity={currentPreCheck?.isSubmitted ? 0.6 : 1}
                    >
                      <Flex direction="column" justify="space-between" align="start" gap={4} h="full">
                        <Box flex={1}>
                          <Heading as="h3" fontSize="lg" mb={2}>
                            {option.value.name}
                          </Heading>
                          <Editor htmlValue={option.value.descriptionHtml} readonly />
                        </Box>
                        <Spacer />
                        <Flex
                          align="center"
                          gap={2}
                          border="1px solid"
                          borderColor={isSelected ? "theme.blueAlt" : "border.light"}
                          bg="white"
                          px={4}
                          py={2}
                          borderRadius="md"
                          alignSelf="flex-end"
                        >
                          <Radio isChecked={isSelected} value={option.value.id} pointerEvents="none" />
                          <Text fontWeight="medium">
                            {isSelected ? t("ui.selected", "Selected") : t("ui.select", "Select")}
                          </Text>
                        </Flex>
                      </Flex>
                    </Box>
                  )
                })}
              </Flex>
              {fieldState.error && (
                <Text color="semantic.error" fontSize="sm" mt={1}>
                  {fieldState.error.message}
                </Text>
              )}
            </>
          )}
        />
      </VStack>

      <FormFooter<IBuildingTypeFormData> handleSubmit={handleSubmit} onSubmit={onSubmit} isLoading={isSubmitting} />
    </Box>
  )
})
