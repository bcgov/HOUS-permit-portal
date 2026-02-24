import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Radio,
  RadioGroup,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useOverheatingCode } from "../../../../hooks/resources/use-overheating-code"
import { useMst } from "../../../../setup/root"
import { EOverheatingCodeSubmittalType, EOverheatingCodeUnits } from "../../../../types/enums"
import { FormFooter } from "./form-footer"

interface IComplianceFormData {
  submittalType: string
  units: string
}

export const Compliance = observer(function Compliance() {
  const { t } = useTranslation()
  const { currentOverheatingCode } = useOverheatingCode()
  const {
    overheatingCodeStore: { updateOverheatingCode },
  } = useMst()

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IComplianceFormData>({
    defaultValues: {
      submittalType: currentOverheatingCode?.submittalType || "",
      units: currentOverheatingCode?.units || "",
    },
  })

  const onSubmit = async (data: IComplianceFormData) => {
    if (!currentOverheatingCode) return
    await updateOverheatingCode(currentOverheatingCode.id, {
      submittalType: data.submittalType || null,
      units: data.units || null,
    })
  }

  return (
    <Box>
      <Heading as="h2" size="lg" mb={2}>
        {t("overheatingCode.sections.compliance.title", "Compliance")}
      </Heading>
      <Text mb={2} color="text.secondary">
        {t(
          "overheatingCode.sections.compliance.description",
          "Key results for code compliance. See page 2 for input summary and page 3 for room by room values."
        )}
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mt={6}>
        <FormControl isInvalid={!!errors.submittalType}>
          <FormLabel fontWeight="bold">
            {t("overheatingCode.sections.compliance.submittalTypeLabel", "Submittal is for")}
          </FormLabel>
          <Controller
            name="submittalType"
            control={control}
            rules={{
              required: t(
                "overheatingCode.sections.compliance.submittalTypeRequired",
                "Please select a submittal type"
              ),
            }}
            render={({ field }) => (
              <RadioGroup {...field}>
                <Stack spacing={3}>
                  <Radio value={EOverheatingCodeSubmittalType.wholeHouse}>
                    {t("overheatingCode.sections.compliance.wholeHouse", "Whole House")}
                  </Radio>
                  <Radio value={EOverheatingCodeSubmittalType.roomByRoom}>
                    {t("overheatingCode.sections.compliance.roomByRoom", "Room by Room")}
                  </Radio>
                </Stack>
              </RadioGroup>
            )}
          />
          <FormErrorMessage>{errors.submittalType?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.units}>
          <FormLabel fontWeight="bold">{t("overheatingCode.sections.compliance.unitsLabel", "Units")}</FormLabel>
          <Controller
            name="units"
            control={control}
            rules={{ required: t("overheatingCode.sections.compliance.unitsRequired", "Please select a unit system") }}
            render={({ field }) => (
              <RadioGroup {...field}>
                <Stack spacing={3}>
                  <Radio value={EOverheatingCodeUnits.imperial}>
                    {t("overheatingCode.sections.compliance.imperial", "Imperial")}
                  </Radio>
                  <Radio value={EOverheatingCodeUnits.metric}>
                    {t("overheatingCode.sections.compliance.metric", "Metric")}
                  </Radio>
                </Stack>
              </RadioGroup>
            )}
          />
          <FormErrorMessage>{errors.units?.message}</FormErrorMessage>
        </FormControl>
      </SimpleGrid>

      <FormFooter<IComplianceFormData> handleSubmit={handleSubmit} onSubmit={onSubmit} isLoading={isSubmitting} />
    </Box>
  )
})
