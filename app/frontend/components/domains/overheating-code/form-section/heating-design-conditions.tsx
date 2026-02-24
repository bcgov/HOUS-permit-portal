import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightAddon,
  Select,
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
import { EOverheatingCodeSoilConductivity, EOverheatingCodeWaterTableDepth } from "../../../../types/enums"
import { FormFooter } from "./form-footer"

interface IHeatingDesignConditionsFormData {
  heatingOutdoorTemp: string
  heatingIndoorTemp: string
  meanSoilTemp: string
  soilConductivity: string
  waterTableDepth: string
  slabFluidTemp: string
}

export const HeatingDesignConditions = observer(function HeatingDesignConditions() {
  const { t } = useTranslation()
  const { currentOverheatingCode } = useOverheatingCode()
  const {
    overheatingCodeStore: { updateOverheatingCode },
  } = useMst()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IHeatingDesignConditionsFormData>({
    defaultValues: {
      heatingOutdoorTemp: currentOverheatingCode?.heatingOutdoorTemp?.toString() ?? "",
      heatingIndoorTemp: currentOverheatingCode?.heatingIndoorTemp?.toString() ?? "",
      meanSoilTemp: currentOverheatingCode?.meanSoilTemp?.toString() ?? "",
      soilConductivity: currentOverheatingCode?.soilConductivity ?? "",
      waterTableDepth: currentOverheatingCode?.waterTableDepth ?? "",
      slabFluidTemp: currentOverheatingCode?.slabFluidTemp?.toString() ?? "",
    },
  })

  const onSubmit = async (data: IHeatingDesignConditionsFormData) => {
    if (!currentOverheatingCode) return
    await updateOverheatingCode(currentOverheatingCode.id, {
      heatingOutdoorTemp: data.heatingOutdoorTemp ? parseFloat(data.heatingOutdoorTemp) : null,
      heatingIndoorTemp: data.heatingIndoorTemp ? parseFloat(data.heatingIndoorTemp) : null,
      meanSoilTemp: data.meanSoilTemp ? parseFloat(data.meanSoilTemp) : null,
      soilConductivity: data.soilConductivity || null,
      waterTableDepth: data.waterTableDepth || null,
      slabFluidTemp: data.slabFluidTemp ? parseFloat(data.slabFluidTemp) : null,
    })
  }

  const tempValidation = {
    validate: (value: string) => {
      if (!value) return true
      const num = parseFloat(value)
      if (isNaN(num)) {
        return t("overheatingCode.sections.heatingDesignConditions.invalidTemp", "Must be a valid number")
      }
      return true
    },
  }

  return (
    <Box>
      <Heading as="h2" size="lg" mb={2}>
        {t("overheatingCode.sections.heatingDesignConditions.title", "Heating Design Conditions")}
      </Heading>
      <Text mb={6} color="text.secondary">
        {t(
          "overheatingCode.sections.heatingDesignConditions.description",
          "Data used for winter (heating season) calculations."
        )}
      </Text>

      <VStack spacing={6} align="stretch">
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <FormControl isInvalid={!!errors.heatingOutdoorTemp}>
            <FormLabel fontWeight="bold">
              {t("overheatingCode.sections.heatingDesignConditions.outdoorTempLabel", "Outdoor Temp")}
            </FormLabel>
            <InputGroup>
              <Input type="number" step="0.1" {...register("heatingOutdoorTemp", tempValidation)} placeholder="-18" />
              <InputRightAddon>°C</InputRightAddon>
            </InputGroup>
            <FormErrorMessage>{errors.heatingOutdoorTemp?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.heatingIndoorTemp}>
            <FormLabel fontWeight="bold">
              {t("overheatingCode.sections.heatingDesignConditions.indoorTempLabel", "Indoor Temp")}
            </FormLabel>
            <InputGroup>
              <Input type="number" step="0.1" {...register("heatingIndoorTemp", tempValidation)} placeholder="22" />
              <InputRightAddon>°C</InputRightAddon>
            </InputGroup>
            <FormErrorMessage>{errors.heatingIndoorTemp?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.meanSoilTemp}>
            <FormLabel fontWeight="bold">
              {t("overheatingCode.sections.heatingDesignConditions.meanSoilTempLabel", "Mean Soil Temp")}
            </FormLabel>
            <InputGroup>
              <Input type="number" step="0.1" {...register("meanSoilTemp", tempValidation)} placeholder="10" />
              <InputRightAddon>°C</InputRightAddon>
            </InputGroup>
            <FormErrorMessage>{errors.meanSoilTemp?.message}</FormErrorMessage>
          </FormControl>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <FormControl>
            <FormLabel fontWeight="bold">
              {t("overheatingCode.sections.heatingDesignConditions.soilConductivityLabel", "Soil Conductivity")}
            </FormLabel>
            <Select {...register("soilConductivity")} placeholder={t("ui.selectPlaceholder", "Select...")}>
              {Object.values(EOverheatingCodeSoilConductivity).map((val) => (
                <option key={val} value={val}>
                  {t(`overheatingCode.sections.heatingDesignConditions.soilConductivityOptions.${val}`, val)}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="bold">
              {t("overheatingCode.sections.heatingDesignConditions.waterTableDepthLabel", "Water Table Depth")}
            </FormLabel>
            <Select {...register("waterTableDepth")} placeholder={t("ui.selectPlaceholder", "Select...")}>
              {Object.values(EOverheatingCodeWaterTableDepth).map((val) => (
                <option key={val} value={val}>
                  {t(`overheatingCode.sections.heatingDesignConditions.waterTableDepthOptions.${val}`, val)}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isInvalid={!!errors.slabFluidTemp}>
            <FormLabel fontWeight="bold">
              {t("overheatingCode.sections.heatingDesignConditions.slabFluidTempLabel", "Slab Fluid Temp")}
            </FormLabel>
            <InputGroup>
              <Input
                type="number"
                step="0.1"
                {...register("slabFluidTemp", tempValidation)}
                placeholder={t(
                  "overheatingCode.sections.heatingDesignConditions.slabFluidTempPlaceholder",
                  "Blank if not heated"
                )}
              />
              <InputRightAddon>°C</InputRightAddon>
            </InputGroup>
            <Text fontSize="xs" color="text.secondary" mt={1}>
              {t(
                "overheatingCode.sections.heatingDesignConditions.slabFluidTempHint",
                "Leave blank if slab is not heated"
              )}
            </Text>
            <FormErrorMessage>{errors.slabFluidTemp?.message}</FormErrorMessage>
          </FormControl>
        </SimpleGrid>
      </VStack>

      <FormFooter<IHeatingDesignConditionsFormData>
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        isLoading={isSubmitting}
      />
    </Box>
  )
})
