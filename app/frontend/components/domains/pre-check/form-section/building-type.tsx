import { Box, Flex, Heading, Radio, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { usePreCheck } from "../../../../hooks/resources/use-pre-check"
import { IPermitType } from "../../../../models/permit-classification"
import { useMst } from "../../../../setup/root"
import { IOption } from "../../../../types/types"
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
      setPermitTypeOptions(options)
    })()
  }, [permitClassificationStore, isFirstNation])

  const onSubmit = async (data: IBuildingTypeFormData) => {
    if (!currentPreCheck) return
    await updatePreCheck(currentPreCheck.id, {
      permitTypeId: data.permitTypeId,
    })
  }

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>
        {t("preCheck.sections.buildingType.title", "Building Type")}
      </Heading>
      <Text mb={6}>
        {t("preCheck.sections.buildingType.description", "Choose the building type that best describes your project")}
      </Text>

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
                      onClick={() => field.onChange(option.value.id)}
                      borderRadius="lg"
                      p={6}
                      border="1px solid"
                      borderColor={isSelected ? "theme.blueAlt" : "border.light"}
                      bg="white"
                      w={{ base: "100%", md: "48%" }}
                      transition="all 0.2s ease-in-out"
                      _hover={{ bg: "hover.blue" }}
                      cursor="pointer"
                    >
                      <Flex direction="column" justify="space-between" align="start" gap={4}>
                        <Box flex={1}>
                          <Heading as="h3" fontSize="lg" mb={2}>
                            {option.value.name}
                          </Heading>
                          <Text color="text.secondary">{option.value.description}</Text>
                        </Box>
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
                <Text color="red.500" fontSize="sm" mt={1}>
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
