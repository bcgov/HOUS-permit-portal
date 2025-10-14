import { Box, FormControl, FormLabel, Heading, Radio, RadioGroup, Stack, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { usePreCheck } from "../../../../hooks/resources/use-pre-check"
import { useMst } from "../../../../setup/root"
import { FormFooter } from "./form-footer"

interface IServicePartnerFormData {
  servicePartner: string
}

export const ServicePartner = observer(function ServicePartner() {
  const { t } = useTranslation()
  const { currentPreCheck } = usePreCheck()
  const {
    preCheckStore: { updatePreCheck },
  } = useMst()
  const [isLoading, setIsLoading] = useState(false)

  const { control, handleSubmit } = useForm<IServicePartnerFormData>({
    defaultValues: {
      servicePartner: currentPreCheck?.servicePartner || "archistar",
    },
  })

  const onSubmit = async (data: IServicePartnerFormData) => {
    if (!currentPreCheck) return

    setIsLoading(true)
    try {
      await updatePreCheck(currentPreCheck.id, {
        servicePartner: data.servicePartner,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>
        {t("preCheck.sections.servicePartner.title", "Service Partner")}
      </Heading>
      <Text mb={6}>{t("preCheck.sections.servicePartner.description", "Select your service partner.")}</Text>

      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>{t("preCheck.sections.servicePartner.label", "Available Service Partners:")}</FormLabel>
          <Controller
            name="servicePartner"
            control={control}
            render={({ field }) => (
              <RadioGroup {...field}>
                <Stack spacing={3}>
                  <Radio value="archistar">
                    <Box>
                      <Text fontWeight="medium">Archistar</Text>
                    </Box>
                  </Radio>
                </Stack>
              </RadioGroup>
            )}
          />
        </FormControl>
      </VStack>

      <FormFooter onContinue={handleSubmit(onSubmit)} isLoading={isLoading} />
    </Box>
  )
})
