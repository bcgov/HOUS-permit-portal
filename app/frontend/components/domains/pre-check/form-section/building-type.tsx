import { Box, Heading, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { usePreCheck } from "../../../../hooks/resources/use-pre-check"
import { useMst } from "../../../../setup/root"
import { FormFooter } from "./form-footer"

interface IBuildingTypeFormData {
  buildingType?: string
  // Add other building-related fields as needed
}

export const BuildingType = observer(function BuildingType() {
  const { t } = useTranslation()
  const { currentPreCheck } = usePreCheck()
  const {
    preCheckStore: { updatePreCheck },
  } = useMst()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit } = useForm<IBuildingTypeFormData>({
    defaultValues: {
      buildingType: "",
    },
  })

  const onSubmit = async (data: IBuildingTypeFormData) => {
    if (!currentPreCheck) return

    setIsLoading(true)
    try {
      await updatePreCheck(currentPreCheck.id, {
        // Building type data will go here when backend is ready
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>
        {t("preCheck.sections.buildingType.title", "Building Type")}
      </Heading>
      <Text mb={6}>{t("preCheck.sections.buildingType.description", "Select your building type.")}</Text>

      <VStack spacing={4} align="stretch">
        {/* Form fields will go here */}
        <Text color="text.secondary">Form fields coming soon...</Text>
      </VStack>

      <FormFooter onContinue={handleSubmit(onSubmit)} isLoading={isLoading} />
    </Box>
  )
})
