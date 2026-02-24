import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightAddon,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useOverheatingCode } from "../../../../hooks/resources/use-overheating-code"
import { useMst } from "../../../../setup/root"
import { FormFooter } from "./form-footer"

interface ICoolingDesignConditionsFormData {
  coolingOutdoorTemp: string
  coolingIndoorTemp: string
  dailyTempRange: string
  latitude: string
}

export const CoolingDesignConditions = observer(function CoolingDesignConditions() {
  const { t } = useTranslation()
  const { currentOverheatingCode } = useOverheatingCode()
  const {
    overheatingCodeStore: { updateOverheatingCode },
  } = useMst()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ICoolingDesignConditionsFormData>({
    defaultValues: {
      coolingOutdoorTemp: currentOverheatingCode?.coolingOutdoorTemp?.toString() ?? "",
      coolingIndoorTemp: currentOverheatingCode?.coolingIndoorTemp?.toString() ?? "",
      dailyTempRange: currentOverheatingCode?.dailyTempRange?.toString() ?? "",
      latitude: currentOverheatingCode?.latitude?.toString() ?? "",
    },
  })

  const onSubmit = async (data: ICoolingDesignConditionsFormData) => {
    if (!currentOverheatingCode) return
    await updateOverheatingCode(currentOverheatingCode.id, {
      coolingOutdoorTemp: data.coolingOutdoorTemp ? parseFloat(data.coolingOutdoorTemp) : null,
      coolingIndoorTemp: data.coolingIndoorTemp ? parseFloat(data.coolingIndoorTemp) : null,
      dailyTempRange: data.dailyTempRange ? parseFloat(data.dailyTempRange) : null,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
    })
  }

  const tempValidation = {
    validate: (value: string) => {
      if (!value) return true
      const num = parseFloat(value)
      if (isNaN(num)) {
        return t("overheatingCode.sections.coolingDesignConditions.invalidNumber", "Must be a valid number")
      }
      return true
    },
  }

  const latitudeValidation = {
    validate: (value: string) => {
      if (!value) return true
      const num = parseFloat(value)
      if (isNaN(num)) {
        return t("overheatingCode.sections.coolingDesignConditions.invalidNumber", "Must be a valid number")
      }
      if (num < 0 || num > 90) {
        return t("overheatingCode.sections.coolingDesignConditions.latitudeRange", "Must be between 0 and 90")
      }
      return true
    },
  }

  return (
    <Box>
      <Heading as="h2" size="lg" mb={2}>
        {t("overheatingCode.sections.coolingDesignConditions.title", "Cooling Design Conditions")}
      </Heading>
      <Text mb={6} color="text.secondary">
        {t(
          "overheatingCode.sections.coolingDesignConditions.description",
          "Data used for summer (cooling season) calculations."
        )}
      </Text>

      <VStack spacing={6} align="stretch">
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} alignItems="end">
          <FormControl isInvalid={!!errors.coolingOutdoorTemp}>
            <Box minH="3.5rem" display="flex" flexDirection="column" justifyContent="flex-end">
              <FormLabel fontWeight="bold" mb={1}>
                {t("overheatingCode.sections.coolingDesignConditions.outdoorTempLabel", "Outdoor Temp")}
              </FormLabel>
            </Box>
            <InputGroup>
              <Input type="number" step="0.1" {...register("coolingOutdoorTemp", tempValidation)} placeholder="31" />
              <InputRightAddon>°C</InputRightAddon>
            </InputGroup>
            <FormErrorMessage>{errors.coolingOutdoorTemp?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.dailyTempRange}>
            <Box minH="3.5rem" display="flex" flexDirection="column" justifyContent="flex-end">
              <FormLabel fontWeight="bold" mb={0}>
                {t("overheatingCode.sections.coolingDesignConditions.rangeLabel", "Range")}
              </FormLabel>
              <Text fontSize="xs" color="text.secondary" mb={1}>
                {t("overheatingCode.sections.coolingDesignConditions.rangeHint", "Summer mean daily temperature range")}
              </Text>
            </Box>
            <InputGroup>
              <Input type="number" step="0.1" {...register("dailyTempRange", tempValidation)} placeholder="7" />
              <InputRightAddon>°C</InputRightAddon>
            </InputGroup>
            <FormErrorMessage>{errors.dailyTempRange?.message}</FormErrorMessage>
          </FormControl>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} alignItems="end">
          <FormControl isInvalid={!!errors.coolingIndoorTemp}>
            <Box minH="3.5rem" display="flex" flexDirection="column" justifyContent="flex-end">
              <FormLabel fontWeight="bold" mb={1}>
                {t("overheatingCode.sections.coolingDesignConditions.indoorTempLabel", "Indoor Temp")}
              </FormLabel>
            </Box>
            <InputGroup>
              <Input type="number" step="0.1" {...register("coolingIndoorTemp", tempValidation)} placeholder="24" />
              <InputRightAddon>°C</InputRightAddon>
            </InputGroup>
            <FormErrorMessage>{errors.coolingIndoorTemp?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.latitude}>
            <Box minH="3.5rem" display="flex" flexDirection="column" justifyContent="flex-end">
              <FormLabel fontWeight="bold" mb={0}>
                {t("overheatingCode.sections.coolingDesignConditions.latitudeLabel", "Latitude")}
              </FormLabel>
              <Text fontSize="xs" color="text.secondary" mb={1}>
                {t("overheatingCode.sections.coolingDesignConditions.latitudeHint", "Degrees north of the equator")}
              </Text>
            </Box>
            <InputGroup>
              <Input type="number" step="0.01" {...register("latitude", latitudeValidation)} placeholder="49.28" />
              <InputRightAddon>°</InputRightAddon>
            </InputGroup>
            <FormErrorMessage>{errors.latitude?.message}</FormErrorMessage>
          </FormControl>
        </SimpleGrid>
      </VStack>

      <FormFooter<ICoolingDesignConditionsFormData>
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        isLoading={isSubmitting}
      />
    </Box>
  )
})
