import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Heading,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { AddressBook } from "@phosphor-icons/react"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IContact, IOption } from "../../../types/types"
import { ContactModal } from "../../shared/contact/contact-modal"
import { DatePickerFormControl, TextFormControl } from "../../shared/form/input-form-control"
import { BuildingLocationFields } from "./building-location-fields"

import { useSectionCompletion } from "../../../hooks/use-section-completion"

export const CoverSheetForm = () => {
  const { t } = useTranslation() as any
  const prefix = "singleZoneCoolingHeatingTool.coverSheet"
  const { setValue, watch, register, formState } = useFormContext()
  const { errors } = formState as any
  const { isOpen: isContactsOpen, onOpen: onContactsOpen, onClose: onContactsClose } = useDisclosure()

  const requiredFields = React.useMemo(
    () => [
      "drawingIssueFor",
      "projectNumber",
      "buildingLocation.model",
      "buildingLocation.site",
      "buildingLocation.lot",
      "buildingLocation.city",
      "buildingLocation.province",
      "buildingLocation.postalCode",
      "heating.building",
      "cooling.nominal",
      "cooling.minimumCoolingCapacity",
      "cooling.maximumCoolingCapacity",
      "calculationPerformedBy.name",
      "calculationPerformedBy.attestation",
      "calculationPerformedBy.address",
      "calculationPerformedBy.company",
      "calculationPerformedBy.city",
      "calculationPerformedBy.postalCode",
      "calculationPerformedBy.phone",
      "calculationPerformedBy.email",
      "calculationPerformedBy.reference1",
      "calculationPerformedBy.reference2",
    ],
    []
  )

  const canContinue = useSectionCompletion({ key: "coverSheet", requiredFields })

  // Keep calculationPerformedBy.name in sync with first/last name fields
  const firstName = watch("calculationPerformedBy.firstName") as string
  const lastName = watch("calculationPerformedBy.lastName") as string
  React.useEffect(() => {
    const full = [firstName, lastName].filter(Boolean).join(" ").trim()
    setValue("calculationPerformedBy.name", full, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstName, lastName])

  const goToInputSummary = () => {
    window.location.hash = "#input-summary"
  }

  const onContactChange = (option: IOption<IContact>) => {
    const contact = option.value
    if (contact.firstName) {
      setValue("calculationPerformedBy.firstName", contact.firstName, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
    }
    if (contact.lastName) {
      setValue("calculationPerformedBy.lastName", contact.lastName, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
    }
    if (contact.businessName) {
      setValue("calculationPerformedBy.attestation", contact.businessName, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
    }
    if (contact.email) {
      setValue("calculationPerformedBy.email", contact.email, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
    }
    if (contact.phone) {
      const phoneNumber = contact.phone.startsWith("+1") ? contact.phone.slice(2) : contact.phone
      setValue("calculationPerformedBy.phone", phoneNumber, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
    }
    if (contact.address) {
      setValue("calculationPerformedBy.address", contact.address, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
    }
    if (contact.businessName) {
      setValue("calculationPerformedBy.company", contact.businessName, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
    }
  }

  return (
    <Box as="form">
      <Box mb={6}>
        <Heading as="h2" size="lg" mb={6} variant="yellowline">
          {t(`${prefix}.title`)}
        </Heading>
        <Text as="p" mb={2}>
          {t(`${prefix}.helpText`)}
        </Text>
      </Box>
      <Divider my={10} />
      <BuildingLocationFields i18nPrefix="singleZoneCoolingHeatingTool.coverSheet.buildingLocation" />
      <Divider my={10} />
      <Box mb={6}>
        <Heading as="h3" size="md" mb={4} variant="yellowline">
          {t(`${prefix}.compliance.title`)}
        </Heading>
      </Box>

      <Flex gap={10}>
        <RadioGroup name="compliance.submittalIsFor">
          <Text as="p" mb={2} fontWeight="bold">
            {t(`${prefix}.compliance.submittalIsFor`)}
          </Text>
          <Stack direction="row" spacing={5}>
            <Radio variant="binary" value="aw">
              {t(`${prefix}.compliance.wholeHouse`)}
            </Radio>
            <Radio variant="binary" value="ar">
              {t(`${prefix}.compliance.roomByRoom`)}
            </Radio>
          </Stack>
        </RadioGroup>
      </Flex>
      <Flex gap={10} mt={6}>
        <RadioGroup name="compliance.units">
          <Text as="p" mb={2} fontWeight="bold">
            {t(`${prefix}.compliance.units`)}
          </Text>
          <Stack direction="row" spacing={5}>
            <Radio variant="binary" value="bi">
              {t(`${prefix}.compliance.imperial`)}
            </Radio>
            <Radio variant="binary" value="bm">
              {t(`${prefix}.compliance.metric`)}
            </Radio>
          </Stack>
        </RadioGroup>
      </Flex>
      <Divider my={10} />
      <Box mb={6}>
        <Heading as="h3" size="md" mb={4} variant="yellowline">
          {t(`${prefix}.attachedDocuments.title`)}
        </Heading>
      </Box>

      <Flex gap={6} mt={8} mb={2}>
        <Checkbox defaultChecked>{t(`${prefix}.attachedDocuments.designSummary`)}</Checkbox>
        <Checkbox defaultChecked>{t(`${prefix}.attachedDocuments.roomByRoomResults`)}</Checkbox>
      </Flex>

      <Text as="p" mt={4} mb={2} fontWeight="bold">
        {t(`${prefix}.other`)}
        <TextFormControl fieldName="other" maxLength={310} width="50%" />
      </Text>
      <Text as="p" mt={4} mb={2} fontWeight="bold">
        {t(`${prefix}.notes`)}
        <TextFormControl fieldName="notes" maxLength={190} width="50%" />
      </Text>
      <Divider my={10} />
      <Box mb={6}>
        <Heading as="h3" size="md" mb={4} variant="yellowline">
          {t(`${prefix}.calculationPerformedBy.title`)}
        </Heading>
      </Box>
      <Grid templateColumns="1fr" gap={6}>
        <Box>
          <FormLabel htmlFor="calculationPerformedBy.firstName">
            {t(`${prefix}.calculationPerformedBy.firstName`)}
          </FormLabel>
          <Flex align="end" gap={3}>
            <Input
              id="calculationPerformedBy.firstName"
              width="50%"
              required
              maxLength={50}
              {...(register as any)("calculationPerformedBy.firstName", {
                required: t("ui.isRequired", { field: t(`${prefix}.calculationPerformedBy.firstName`) }) as string,
              })}
            />
            <Button
              variant="outline"
              size="md"
              leftIcon={<AddressBook size={16} />}
              onClick={onContactsOpen}
              alignSelf="start"
            >
              {t("ui.autofill")}
            </Button>
          </Flex>
        </Box>
        <Box>
          <FormLabel htmlFor="calculationPerformedBy.lastName">
            {t(`${prefix}.calculationPerformedBy.lastName`)}
          </FormLabel>
          <Input
            id="calculationPerformedBy.lastName"
            width="50%"
            required
            maxLength={50}
            {...(register as any)("calculationPerformedBy.lastName", {
              required: t("ui.isRequired", { field: t(`${prefix}.calculationPerformedBy.lastName`) }) as string,
            })}
          />
        </Box>
        {/* Autofill button moved next to first name input */}
        <Box>
          <HStack spacing={3} align="start">
            <Box flex={1}>
              <Checkbox {...(register as any)("calculationPerformedBy.attestation")} mt={8}>
                {t(`${prefix}.calculationPerformedBy.attestation`)}
              </Checkbox>
            </Box>
          </HStack>
          <Text as="p" mt={1} mb={2}>
            {t(`${prefix}.calculationPerformedBy.helpText`)}
          </Text>
        </Box>

        <FormControl isInvalid={!!errors?.calculationPerformedBy?.address}>
          <FormLabel htmlFor="calculationPerformedBy.address">
            {t(`${prefix}.calculationPerformedBy.address`)}
          </FormLabel>
          <Input
            id="calculationPerformedBy.address"
            width="50%"
            maxLength={50}
            {...(register as any)("calculationPerformedBy.address", {
              required: t("ui.isRequired", { field: t(`${prefix}.calculationPerformedBy.address`) }) as string,
            })}
          />
          <FormErrorMessage>{errors?.calculationPerformedBy?.address?.message as any}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors?.calculationPerformedBy?.company}>
          <FormLabel htmlFor="calculationPerformedBy.company">
            {t(`${prefix}.calculationPerformedBy.company`)}
          </FormLabel>
          <Input
            id="calculationPerformedBy.company"
            width="50%"
            maxLength={50}
            {...(register as any)("calculationPerformedBy.company", {
              required: t("ui.isRequired", { field: t(`${prefix}.calculationPerformedBy.company`) }) as string,
            })}
          />
          <FormErrorMessage>{errors?.calculationPerformedBy?.company?.message as any}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors?.calculationPerformedBy?.city}>
          <FormLabel htmlFor="calculationPerformedBy.city">{t(`${prefix}.calculationPerformedBy.city`)}</FormLabel>
          <Input
            id="calculationPerformedBy.city"
            width="50%"
            maxLength={50}
            {...(register as any)("calculationPerformedBy.city", {
              required: t("ui.isRequired", { field: t(`${prefix}.calculationPerformedBy.city`) }) as string,
            })}
          />
          <FormErrorMessage>{errors?.calculationPerformedBy?.city?.message as any}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors?.calculationPerformedBy?.province}>
          <FormLabel htmlFor="calculationPerformedBy.province">
            {t(`${prefix}.calculationPerformedBy.province`)}
          </FormLabel>
          <Input
            id="calculationPerformedBy.province"
            width="50%"
            maxLength={50}
            {...(register as any)("calculationPerformedBy.province", {
              required: t("ui.isRequired", { field: t(`${prefix}.calculationPerformedBy.province`) }) as string,
            })}
          />
          <FormErrorMessage>{errors?.calculationPerformedBy?.province?.message as any}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors?.calculationPerformedBy?.postalCode}>
          <FormLabel htmlFor="calculationPerformedBy.postalCode">
            {t(`${prefix}.calculationPerformedBy.postalCode`)}
          </FormLabel>
          <Input
            id="calculationPerformedBy.postalCode"
            width="50%"
            maxLength={50}
            {...(register as any)("calculationPerformedBy.postalCode", {
              required: t("ui.isRequired", { field: t(`${prefix}.calculationPerformedBy.postalCode`) }) as string,
            })}
          />
          <FormErrorMessage>{errors?.calculationPerformedBy?.postalCode?.message as any}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors?.calculationPerformedBy?.phone}>
          <FormLabel htmlFor="calculationPerformedBy.phone">{t(`${prefix}.calculationPerformedBy.phone`)}</FormLabel>
          <Input
            id="calculationPerformedBy.phone"
            width="50%"
            maxLength={50}
            {...(register as any)("calculationPerformedBy.phone", {
              required: t("ui.isRequired", { field: t(`${prefix}.calculationPerformedBy.phone`) }) as string,
            })}
          />
          <FormErrorMessage>{errors?.calculationPerformedBy?.phone?.message as any}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors?.calculationPerformedBy?.email}>
          <FormLabel htmlFor="calculationPerformedBy.email">{t(`${prefix}.calculationPerformedBy.email`)}</FormLabel>
          <Input
            id="calculationPerformedBy.email"
            width="50%"
            maxLength={50}
            type="email"
            {...(register as any)("calculationPerformedBy.email", {
              required: t("ui.isRequired", { field: t(`${prefix}.calculationPerformedBy.email`) }) as string,
            })}
          />
          <FormErrorMessage>{errors?.calculationPerformedBy?.email?.message as any}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors?.calculationPerformedBy?.fax}>
          <FormLabel htmlFor="calculationPerformedBy.fax">{t(`${prefix}.calculationPerformedBy.fax`)}</FormLabel>
          <Input
            id="calculationPerformedBy.fax"
            width="50%"
            maxLength={50}
            {...(register as any)("calculationPerformedBy.fax", {
              required: t("ui.isRequired", { field: t(`${prefix}.calculationPerformedBy.fax`) }) as string,
            })}
          />
          <FormErrorMessage>{errors?.calculationPerformedBy?.fax?.message as any}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors?.calculationPerformedBy?.reference1}>
          <FormLabel htmlFor="calculationPerformedBy.reference1">
            {t(`${prefix}.calculationPerformedBy.reference1`)}
          </FormLabel>
          <Input
            id="calculationPerformedBy.reference1"
            width="50%"
            maxLength={50}
            {...(register as any)("calculationPerformedBy.reference1", {
              required: t("ui.isRequired", { field: t(`${prefix}.calculationPerformedBy.reference1`) }) as string,
            })}
          />
          <FormErrorMessage>{errors?.calculationPerformedBy?.reference1?.message as any}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors?.calculationPerformedBy?.reference2}>
          <FormLabel htmlFor="calculationPerformedBy.reference2">
            {t(`${prefix}.calculationPerformedBy.reference2`)}
          </FormLabel>
          <Input
            id="calculationPerformedBy.reference2"
            width="50%"
            maxLength={50}
            {...(register as any)("calculationPerformedBy.reference2", {
              required: t("ui.isRequired", { field: t(`${prefix}.calculationPerformedBy.reference2`) }) as string,
            })}
          />
          <FormErrorMessage>{errors?.calculationPerformedBy?.reference2?.message as any}</FormErrorMessage>
        </FormControl>
        <DatePickerFormControl
          label={t(`${prefix}.calculationPerformedBy.issuedForDate`)}
          fieldName={"calculationPerformedBy.issuedForDate"}
          showOptional={false}
          width="50%"
          zIndex={2}
        />
        <DatePickerFormControl
          label={t(`${prefix}.calculationPerformedBy.issuedForDate2`)}
          fieldName={"calculationPerformedBy.issuedForDate2"}
          showOptional={false}
          width="50%"
          zIndex={1}
        />
      </Grid>
      <Divider my={10} />
      <Box mb={6}>
        <Heading as="h3" size="md" mb={4} variant="yellowline">
          {t(`${prefix}.heating.title`)}
        </Heading>
      </Box>
      <Box width="30%">
        <FormControl isInvalid={!!errors?.heating?.building}>
          <FormLabel htmlFor="heating.building">{t(`${prefix}.heating.building`)}</FormLabel>
          <Input
            id="heating.building"
            type="number"
            step={1}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={15}
            {...(register as any)("heating.building", {
              required: t("ui.isRequired", { field: t(`${prefix}.heating.building`) }) as string,
            })}
          />
          <FormErrorMessage>{errors?.heating?.building?.message as any}</FormErrorMessage>
        </FormControl>
      </Box>
      <Text as="p" mb={2} mt={2}>
        <Text as="span" fontWeight="bold">
          {t(`${prefix}.heating.helpText`)}
        </Text>
        <br />
        <Text as="span" fontWeight="bold">
          {t(`${prefix}.heating.helpText2`)}
        </Text>
      </Text>
      <Divider my={10} />
      <Box mb={6}>
        <Heading as="h3" size="md" mb={4} variant="yellowline">
          {t(`${prefix}.cooling.title`)}
        </Heading>
      </Box>
      <Box width="30%">
        <FormControl isInvalid={!!errors?.cooling?.nominal}>
          <FormLabel htmlFor="cooling.nominal">{t(`${prefix}.cooling.nominal`)}</FormLabel>
          <Input
            id="cooling.nominal"
            type="number"
            step={1}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={15}
            {...(register as any)("cooling.nominal", {
              required: t("ui.isRequired", { field: t(`${prefix}.cooling.nominal`) }) as string,
            })}
          />
          <FormErrorMessage>{errors?.cooling?.nominal?.message as any}</FormErrorMessage>
        </FormControl>
      </Box>
      <Box width="30%">
        <FormControl isInvalid={!!errors?.cooling?.minimumCoolingCapacity}>
          <FormLabel htmlFor="cooling.minimumCoolingCapacity">
            {t(`${prefix}.cooling.minimumCoolingCapacity`)}
          </FormLabel>
          <Input
            id="cooling.minimumCoolingCapacity"
            type="number"
            step={1}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={15}
            {...(register as any)("cooling.minimumCoolingCapacity", {
              required: t("ui.isRequired", { field: t(`${prefix}.cooling.minimumCoolingCapacity`) }) as string,
            })}
          />
          <FormErrorMessage>{errors?.cooling?.minimumCoolingCapacity?.message as any}</FormErrorMessage>
        </FormControl>
      </Box>
      <Box width="30%">
        <FormControl isInvalid={!!errors?.cooling?.maximumCoolingCapacity}>
          <FormLabel htmlFor="cooling.maximumCoolingCapacity">
            {t(`${prefix}.cooling.maximumCoolingCapacity`)}
          </FormLabel>
          <Input
            id="cooling.maximumCoolingCapacity"
            type="number"
            step={1}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={15}
            {...(register as any)("cooling.maximumCoolingCapacity", {
              required: t("ui.isRequired", { field: t(`${prefix}.cooling.maximumCoolingCapacity`) }) as string,
            })}
          />
          <FormErrorMessage>{errors?.cooling?.maximumCoolingCapacity?.message as any}</FormErrorMessage>
        </FormControl>
      </Box>
      <Text as="p" mt={3} mb={2} fontWeight="bold">
        {t(`${prefix}.cooling.helpText`)}
      </Text>
      <Text as="p" mt={3} mb={2} fontWeight="bold">
        {t(`${prefix}.cooling.helpText2`)}
      </Text>
      <Text as="p" mt={3} mb={2} fontWeight="bold">
        {t(`${prefix}.cooling.helpText3`)}
      </Text>
      <Text as="p" mt={3} mb={2} fontWeight="bold">
        {t(`${prefix}.cooling.helpText4`)}
      </Text>

      <Flex justify="flex-start" mt={10} mb={10}>
        {canContinue && (
          <Button variant="primary" onClick={goToInputSummary}>
            {t(`${prefix}.calculationPerformedBy.next`)}
          </Button>
        )}
      </Flex>

      {/* Contact Modal for autofill */}
      <ContactModal
        isOpen={isContactsOpen}
        onOpen={onContactsOpen}
        onClose={onContactsClose}
        onContactChange={onContactChange}
        submissionState={{ data: {} }}
        setSubmissionState={() => {}}
      />
    </Box>
  )
}
