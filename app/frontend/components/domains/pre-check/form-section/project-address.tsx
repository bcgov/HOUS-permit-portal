import { Box, Heading, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { usePreCheck } from "../../../../hooks/resources/use-pre-check"
import { useMst } from "../../../../setup/root"
import { FormFooter } from "./form-footer"

interface IProjectAddressFormData {
  fullAddress: string
}

export const ProjectAddress = observer(function ProjectAddress() {
  const { t } = useTranslation()
  const { currentPreCheck } = usePreCheck()
  const {
    preCheckStore: { updatePreCheck },
  } = useMst()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit } = useForm<IProjectAddressFormData>({
    defaultValues: {
      fullAddress: currentPreCheck?.fullAddress || "",
    },
  })

  const onSubmit = async (data: IProjectAddressFormData) => {
    if (!currentPreCheck) return

    setIsLoading(true)
    try {
      await updatePreCheck(currentPreCheck.id, {
        fullAddress: data.fullAddress,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>
        {t("preCheck.sections.projectAddress.title", "Project Address")}
      </Heading>
      <Text mb={6}>
        {t(
          "preCheck.sections.projectAddress.description",
          "Enter an address to confirm the service is available for your building project"
        )}
      </Text>

      <VStack spacing={4} align="stretch">
        {/* Form fields will go here */}
        <Text color="text.secondary">Form fields coming soon...</Text>
      </VStack>

      <FormFooter onContinue={handleSubmit(onSubmit)} isLoading={isLoading} />
    </Box>
  )
})
