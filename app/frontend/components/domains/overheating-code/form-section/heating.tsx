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

interface IHeatingFormData {
  minimumHeatingCapacity: string
}

export const Heating = observer(function Heating() {
  const { t } = useTranslation()
  const { currentOverheatingCode } = useOverheatingCode()
  const {
    overheatingCodeStore: { updateOverheatingCode },
  } = useMst()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IHeatingFormData>({
    defaultValues: {
      minimumHeatingCapacity: currentOverheatingCode?.minimumHeatingCapacity?.toString() || "",
    },
  })

  const onSubmit = async (data: IHeatingFormData) => {
    if (!currentOverheatingCode) return
    await updateOverheatingCode(currentOverheatingCode.id, {
      minimumHeatingCapacity: data.minimumHeatingCapacity ? parseFloat(data.minimumHeatingCapacity) : null,
    })
  }

  return (
    <Box>
      <Heading as="h2" size="lg" mb={2}>
        {t("overheatingCode.sections.heating.title", "Heating")}
      </Heading>
      <Text mb={6} color="text.secondary">
        {t(
          "overheatingCode.sections.heating.description",
          "Enter the minimum heating capacity for the building based on total building heat loss calculations."
        )}
      </Text>

      <VStack spacing={6} align="stretch">
        <FormControl isInvalid={!!errors.minimumHeatingCapacity}>
          <FormLabel fontWeight="bold">
            {t("overheatingCode.sections.heating.capacityLabel", "Minimum Heating Capacity")}
          </FormLabel>
          <Text fontSize="sm" color="text.secondary" mb={2}>
            {t("overheatingCode.sections.heating.capacityHint", "Total building heat loss as per Clause 5.2.7")}
          </Text>
          <InputGroup maxW="400px">
            <Input
              type="number"
              step="0.01"
              {...register("minimumHeatingCapacity", {
                validate: (value) => {
                  if (!value) return true
                  const num = parseFloat(value)
                  if (isNaN(num) || num < 0) {
                    return t("overheatingCode.sections.heating.capacityInvalid", "Must be a positive number")
                  }
                  return true
                },
              })}
              placeholder="0.00"
            />
            <InputRightAddon>{t("overheatingCode.sections.heating.unit", "btuh")}</InputRightAddon>
          </InputGroup>
          <FormErrorMessage>{errors.minimumHeatingCapacity?.message}</FormErrorMessage>
        </FormControl>

        <Box bg="gray.50" border="1px solid" borderColor="border.light" borderRadius="md" p={5}>
          <Heading as="h4" size="sm" mb={3}>
            {t("overheatingCode.sections.heating.complianceTitle", "Compliance Requirements")}
          </Heading>
          <OrderedList spacing={4} fontSize="sm" color="text.secondary" styleType="none" ml={0}>
            <ListItem>
              <Text as="span" fontWeight="bold" mr={2}>
                5.3.1
              </Text>
              {t(
                "overheatingCode.sections.heating.clause531",
                "The total heat output capacity of all heating systems installed in a building shall not be less than 100% of the total building heat loss as determined in Clause 5.2.7."
              )}
            </ListItem>
            <ListItem>
              <Text as="span" fontWeight="bold" mr={2}>
                5.3.2
              </Text>
              {t(
                "overheatingCode.sections.heating.clause532",
                "The combined heating delivery of the heating systems that serve a room or space shall not be less than 100% of the space heat loss, as determined in Clause 5.2.6. (If room by room submittal, see page 2 for individual space heating requirements)"
              )}
            </ListItem>
          </OrderedList>
        </Box>
      </VStack>

      <FormFooter<IHeatingFormData> handleSubmit={handleSubmit} onSubmit={onSubmit} isLoading={isSubmitting} />
    </Box>
  )
})
