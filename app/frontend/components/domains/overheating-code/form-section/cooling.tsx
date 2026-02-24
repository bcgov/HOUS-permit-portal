import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightAddon,
  ListItem,
  OrderedList,
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

interface ICoolingFormData {
  nominalCoolingCapacity: string
  minimumCoolingCapacity: string
  maximumCoolingCapacity: string
}

const positiveNumberValidation = (t: any) => (value: string) => {
  if (!value) return true
  const num = parseFloat(value)
  if (isNaN(num) || num < 0) {
    return t("overheatingCode.sections.cooling.capacityInvalid", "Must be a positive number")
  }
  return true
}

export const Cooling = observer(function Cooling() {
  const { t } = useTranslation()
  const { currentOverheatingCode } = useOverheatingCode()
  const {
    overheatingCodeStore: { updateOverheatingCode },
  } = useMst()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ICoolingFormData>({
    defaultValues: {
      nominalCoolingCapacity: currentOverheatingCode?.nominalCoolingCapacity?.toString() || "",
      minimumCoolingCapacity: currentOverheatingCode?.minimumCoolingCapacity?.toString() || "",
      maximumCoolingCapacity: currentOverheatingCode?.maximumCoolingCapacity?.toString() || "",
    },
  })

  const parseDecimal = (val: string) => (val ? parseFloat(val) : null)

  const onSubmit = async (data: ICoolingFormData) => {
    if (!currentOverheatingCode) return
    await updateOverheatingCode(currentOverheatingCode.id, {
      nominalCoolingCapacity: parseDecimal(data.nominalCoolingCapacity),
      minimumCoolingCapacity: parseDecimal(data.minimumCoolingCapacity),
      maximumCoolingCapacity: parseDecimal(data.maximumCoolingCapacity),
    })
  }

  const validate = positiveNumberValidation(t)

  return (
    <Box>
      <Heading as="h2" size="lg" mb={2}>
        {t("overheatingCode.sections.cooling.title", "Cooling")}
      </Heading>
      <Text mb={6} color="text.secondary">
        {t(
          "overheatingCode.sections.cooling.description",
          "Enter the cooling capacity values for the building. The nominal capacity is required; minimum and maximum are calculated based on compliance clauses below."
        )}
      </Text>

      <VStack spacing={6} align="stretch">
        <FormControl isInvalid={!!errors.nominalCoolingCapacity}>
          <FormLabel fontWeight="bold">
            {t("overheatingCode.sections.cooling.nominalLabel", "Nominal Cooling Capacity")}
          </FormLabel>
          <Text fontSize="sm" color="text.secondary" mb={2}>
            {t("overheatingCode.sections.cooling.nominalHint", "Nominal Cooling Capacity as per Clause 6.3.1")}
          </Text>
          <InputGroup maxW="400px">
            <Input type="number" step="0.01" {...register("nominalCoolingCapacity", { validate })} placeholder="0.00" />
            <InputRightAddon>{t("overheatingCode.sections.cooling.unit", "btuh")}</InputRightAddon>
          </InputGroup>
          <FormErrorMessage>{errors.nominalCoolingCapacity?.message}</FormErrorMessage>
        </FormControl>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl isInvalid={!!errors.minimumCoolingCapacity}>
            <FormLabel>{t("overheatingCode.sections.cooling.minimumLabel", "Minimum Cooling Capacity")}</FormLabel>
            <InputGroup>
              <Input
                type="number"
                step="0.01"
                {...register("minimumCoolingCapacity", { validate })}
                placeholder="0.00"
              />
              <InputRightAddon>{t("overheatingCode.sections.cooling.unit", "btuh")}</InputRightAddon>
            </InputGroup>
            <FormErrorMessage>{errors.minimumCoolingCapacity?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.maximumCoolingCapacity}>
            <FormLabel>{t("overheatingCode.sections.cooling.maximumLabel", "Maximum Cooling Capacity")}</FormLabel>
            <InputGroup>
              <Input
                type="number"
                step="0.01"
                {...register("maximumCoolingCapacity", { validate })}
                placeholder="0.00"
              />
              <InputRightAddon>{t("overheatingCode.sections.cooling.unit", "btuh")}</InputRightAddon>
            </InputGroup>
            <FormErrorMessage>{errors.maximumCoolingCapacity?.message}</FormErrorMessage>
          </FormControl>
        </SimpleGrid>

        <Box bg="gray.50" border="1px solid" borderColor="border.light" borderRadius="md" p={5}>
          <Heading as="h4" size="sm" mb={3}>
            {t("overheatingCode.sections.cooling.complianceTitle", "Compliance Requirements")}
          </Heading>
          <OrderedList spacing={4} fontSize="sm" color="text.secondary" styleType="none" ml={0}>
            <ListItem>
              <Text as="span" fontWeight="bold" mr={2}>
                6.3.2
              </Text>
              {t(
                "overheatingCode.sections.cooling.clause632",
                "Except as provided in Clause 6.3.3., the cooling system capacity shall not be less than 80% of the nominal cooling capacity for the building, as determined in Clause 6.3.1. In no case shall it be less than the nominal cooling capacity of the building minus 1800 W (0.51 tons)"
              )}
            </ListItem>
            <ListItem>
              <Text as="span" fontWeight="bold" mr={2}>
                6.3.3
              </Text>
              {t(
                "overheatingCode.sections.cooling.clause633",
                "Where the cooling system is added to an existing heating system, its capacity in Watts shall not exceed 18 times the capacity of the air-handling capacity of the existing system in L/s. (Cooling capacity in Tons not more than 1.0 per 400 CFM of air handling capacity)"
              )}
            </ListItem>
            <ListItem>
              <Text as="span" fontWeight="bold" mr={2}>
                6.3.4
              </Text>
              {t(
                "overheatingCode.sections.cooling.clause634",
                "Except for ground-source and water source heat pumps used for cooling, and as permitted in Clause 6.3.5, the installed cooling capacity shall not exceed 125% of the nominal cooling capacity for the building, as determined in Clause 6.3.1."
              )}
            </ListItem>
            <ListItem>
              <Text as="span" fontWeight="bold" mr={2}>
                6.3.5
              </Text>
              {t(
                "overheatingCode.sections.cooling.clause635",
                "If the nominal cooling system capacity for the building, as determined in Clause 6.3.1. is less than 6,000 W (1.7 tons), the installed cooling system capacity may exceed the nominal cooling system capacity for the building by up to 1750 W (0.49 tons)."
              )}
            </ListItem>
          </OrderedList>
        </Box>
      </VStack>

      <FormFooter<ICoolingFormData> handleSubmit={handleSubmit} onSubmit={onSubmit} isLoading={isSubmitting} />
    </Box>
  )
})
