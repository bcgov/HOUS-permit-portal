import { Box, Field, Flex, Heading, Input, Separator, SimpleGrid, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useOverheatingCode } from "../../../../hooks/resources/use-overheating-code"
import { useMst } from "../../../../setup/root"
import { FormFooter } from "./form-footer"

interface ICalculationsPerformedByFormData {
  performerName: string
  performerCompany: string
  performerAddress: string
  performerCityProvince: string
  performerPostalCode: string
  performerPhone: string
  performerFax: string
  performerEmail: string
  accreditationRef1: string
  accreditationRef2: string
  issuedFor1: string
  issuedFor2: string
}

// [OVERHEATING TODO] Should these fields be pre-populated with the logged-in user's data?
// Currently assuming YES — we seed defaults from currentUser on first load when fields are empty.
// [OVERHEATING TODO] Which fields here should be mandatory? Currently requiring: name, email,
// accreditationRef1. Should company, address, phone, issuedFor1 also be required?
export const CalculationsPerformedBy = observer(function CalculationsPerformedBy() {
  const { t } = useTranslation()
  const { currentOverheatingCode } = useOverheatingCode()
  const {
    userStore,
    overheatingCodeStore: { updateOverheatingCode },
  } = useMst()
  const currentUser = userStore.currentUser

  const defaultValues = useMemo<ICalculationsPerformedByFormData>(() => {
    const oc = currentOverheatingCode
    const userName =
      oc?.performerName || [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ") || ""

    return {
      performerName: userName,
      performerCompany: oc?.performerCompany || "",
      performerAddress: oc?.performerAddress || "",
      performerCityProvince: oc?.performerCityProvince || "",
      performerPostalCode: oc?.performerPostalCode || "",
      performerPhone: oc?.performerPhone || "",
      performerFax: oc?.performerFax || "",
      performerEmail: oc?.performerEmail || currentUser?.email || "",
      accreditationRef1: oc?.accreditationRef1 || "",
      accreditationRef2: oc?.accreditationRef2 || "",
      issuedFor1: oc?.issuedFor1 || "",
      issuedFor2: oc?.issuedFor2 || "",
    }
  }, [currentOverheatingCode?.id])

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<ICalculationsPerformedByFormData>({
    mode: "onChange",
    defaultValues,
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues])

  const onSubmit = async (data: ICalculationsPerformedByFormData) => {
    if (!currentOverheatingCode) return
    await updateOverheatingCode(currentOverheatingCode.id, data)
  }

  return (
    <Box>
      <Heading as="h2" size="lg" mb={2}>
        {t("overheatingCode.sections.calculationsPerformedBy.title")}
      </Heading>
      <Text mb={6} color="text.secondary">
        {t("overheatingCode.sections.calculationsPerformedBy.description")}
      </Text>
      {/* Contact Information */}
      <Heading as="h3" size="md" mb={4}>
        {t("overheatingCode.sections.calculationsPerformedBy.contactInfoHeading")}
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={5} mb={6}>
        <Field.Root required invalid={!!errors.performerName}>
          <Field.Label>{t("overheatingCode.sections.calculationsPerformedBy.fields.name")}</Field.Label>
          <Input {...register("performerName", { required: true })} />
        </Field.Root>

        <Field.Root>
          <Field.Label>{t("overheatingCode.sections.calculationsPerformedBy.fields.company")}</Field.Label>
          <Input {...register("performerCompany")} />
        </Field.Root>

        <Field.Root>
          <Field.Label>{t("overheatingCode.sections.calculationsPerformedBy.fields.address")}</Field.Label>
          <Input {...register("performerAddress")} />
        </Field.Root>

        <Field.Root>
          <Field.Label>{t("overheatingCode.sections.calculationsPerformedBy.fields.cityProvince")}</Field.Label>
          <Input {...register("performerCityProvince")} placeholder="e.g. Vancouver, BC" />
        </Field.Root>

        <Field.Root>
          <Field.Label>{t("overheatingCode.sections.calculationsPerformedBy.fields.postalCode")}</Field.Label>
          <Input
            {...register("performerPostalCode", {
              pattern: {
                value: /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/,
                message: t("overheatingCode.sections.calculationsPerformedBy.validation.postalCode"),
              },
            })}
            placeholder="e.g. V7L 1C3"
          />
          {errors.performerPostalCode && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.performerPostalCode.message}
            </Text>
          )}
        </Field.Root>

        <Field.Root>
          <Field.Label>{t("overheatingCode.sections.calculationsPerformedBy.fields.phone")}</Field.Label>
          <Input {...register("performerPhone")} type="tel" placeholder="e.g. (604) 555-0123" />
        </Field.Root>

        <Field.Root>
          <Field.Label>{t("overheatingCode.sections.calculationsPerformedBy.fields.fax")}</Field.Label>
          <Input {...register("performerFax")} type="tel" />
        </Field.Root>

        <Field.Root required invalid={!!errors.performerEmail}>
          <Field.Label>{t("overheatingCode.sections.calculationsPerformedBy.fields.email")}</Field.Label>
          <Input
            {...register("performerEmail", {
              required: true,
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t("overheatingCode.sections.calculationsPerformedBy.validation.email"),
              },
            })}
            type="email"
          />
          {errors.performerEmail && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.performerEmail.message}
            </Text>
          )}
        </Field.Root>
      </SimpleGrid>
      <Separator my={6} />
      {/* Attestation */}
      <Heading as="h3" size="md" mb={2}>
        {t("overheatingCode.sections.calculationsPerformedBy.attestationHeading")}
      </Heading>
      <Box bg="blue.50" borderRadius="md" p={4} mb={6} borderLeft="4px solid" borderLeftColor="blue.400">
        <Text fontSize="sm" fontStyle="italic" color="text.secondary">
          {t("overheatingCode.sections.calculationsPerformedBy.attestationText")}
        </Text>
      </Box>
      <Flex gap={5} mb={6} direction={{ base: "column", md: "row" }}>
        <Box flex={1} borderWidth="1px" borderColor="border.light" borderRadius="md" p={4}>
          <Field.Root required invalid={!!errors.accreditationRef1} mb={4}>
            <Field.Label>{t("overheatingCode.sections.calculationsPerformedBy.fields.accreditationRef1")}</Field.Label>
            <Input {...register("accreditationRef1", { required: true })} />
          </Field.Root>

          <Field.Root required>
            <Field.Label>{t("overheatingCode.sections.calculationsPerformedBy.fields.issuedFor")}</Field.Label>
            <Input {...register("issuedFor1", { required: true })} type="date" />
          </Field.Root>
        </Box>

        <Box flex={1} borderWidth="1px" borderColor="border.light" borderRadius="md" p={4}>
          <Field.Root mb={4}>
            <Field.Label>{t("overheatingCode.sections.calculationsPerformedBy.fields.accreditationRef2")}</Field.Label>
            <Input {...register("accreditationRef2")} />
          </Field.Root>

          <Field.Root>
            <Field.Label>{t("overheatingCode.sections.calculationsPerformedBy.fields.issuedFor")}</Field.Label>
            <Input {...register("issuedFor2")} type="date" />
          </Field.Root>
        </Box>
      </Flex>
      <FormFooter<ICalculationsPerformedByFormData>
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        loading={isSubmitting}
      />
    </Box>
  )
})
