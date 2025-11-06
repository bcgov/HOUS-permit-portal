import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  Grid,
  Heading,
  HStack,
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
import { EmailFormControl } from "../../shared/form/email-form-control"
import {
  DatePickerFormControl,
  NumberFormControl,
  PhoneFormControl,
  TextFormControl,
} from "../../shared/form/input-form-control"
import { BuildingLocationFields } from "./building-location-fields"

interface ICoverSheetFormProps {
  onNext: () => void
}

export const CoverSheetForm = ({ onNext }: ICoverSheetFormProps) => {
  const { t } = useTranslation() as any
  const prefix = "singleZoneCoolingHeatingTool.coverSheet"
  const { setValue } = useFormContext()
  const { isOpen: isContactsOpen, onOpen: onContactsOpen, onClose: onContactsClose } = useDisclosure()

  const onContactChange = (option: IOption<IContact>) => {
    const contact = option.value
    if (contact.firstName && contact.lastName) {
      setValue("calculationPerformedBy.name", `${contact.firstName} ${contact.lastName}`, {
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
    <Box as="form" p={4}>
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
          <Text as="p" mb={2}>
            {t(`${prefix}.compliance.submittalIsFor`)}
          </Text>
          <Stack direction="row" spacing={5}>
            <Radio value="aw">{t(`${prefix}.compliance.wholeHouse`)}</Radio>
            <Radio value="ar">{t(`${prefix}.compliance.roomByRoom`)}</Radio>
          </Stack>
        </RadioGroup>
        <RadioGroup name="compliance.units">
          <Text as="p" mb={2}>
            {t(`${prefix}.compliance.units`)}
          </Text>
          <Stack direction="row" spacing={5}>
            <Radio value="bi">{t(`${prefix}.compliance.imperial`)}</Radio>
            <Radio value="bm">{t(`${prefix}.compliance.metric`)}</Radio>
          </Stack>
        </RadioGroup>
      </Flex>
      <Divider my={10} />
      <Box mb={6}>
        <Heading as="h3" size="md" mb={4} variant="yellowline">
          {t(`${prefix}.heating.title`)}
        </Heading>
      </Box>
      <NumberFormControl
        width="30%"
        fieldName="heating.building"
        required
        label={t(`${prefix}.heating.building`)}
        inputProps={{
          type: "number",
          step: 1,
          inputMode: "numeric",
          pattern: "[0-9]*",
          maxLength: 15,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            if (value.length > 15) {
              e.target.value = value.slice(0, 15)
            }
          },
        }}
        validate={{
          isNumber: (v: any) => (!isNaN(Number(v)) && v !== "") || t("ui.invalidInput"),
          maxLength: (v: any) => !v || String(v).length <= 15 || true,
        }}
        rightElement={
          <Text fontSize="sm" whiteSpace="nowrap" position="absolute" left="50px" top="2">
            {t(`${prefix}.heating.units`)} {t(`${prefix}.heating.unitsHelpText`)}
          </Text>
        }
      />
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
      <NumberFormControl
        width="30%"
        required
        fieldName="cooling.nominal"
        label={t(`${prefix}.cooling.nominal`)}
        inputProps={{
          type: "number",
          step: 1,
          inputMode: "numeric",
          pattern: "[0-9]*",
          maxLength: 15,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            if (value.length > 15) {
              e.target.value = value.slice(0, 15)
            }
          },
        }}
        rightElement={
          <Text fontSize="sm" whiteSpace="nowrap" position="absolute" left="50px" top="2">
            {t(`${prefix}.cooling.units`)} {t(`${prefix}.cooling.unitsHelpText`)}
          </Text>
        }
      />
      <NumberFormControl
        width="30%"
        required
        fieldName="cooling.minimumCoolingCapacity"
        label={t(`${prefix}.cooling.minimumCoolingCapacity`)}
        inputProps={{
          type: "number",
          step: 1,
          inputMode: "numeric",
          pattern: "[0-9]*",
          maxLength: 15,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            if (value.length > 15) {
              e.target.value = value.slice(0, 15)
            }
          },
        }}
        rightElement={
          <Text fontSize="sm" whiteSpace="nowrap" position="absolute" left="50px" top="2">
            {t(`${prefix}.cooling.units`)}
          </Text>
        }
      />
      <NumberFormControl
        width="30%"
        required
        fieldName="cooling.maximumCoolingCapacity"
        label={t(`${prefix}.cooling.maximumCoolingCapacity`)}
        inputProps={{
          type: "number",
          step: 1,
          inputMode: "numeric",
          pattern: "[0-9]*",
          maxLength: 15,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            if (value.length > 15) {
              e.target.value = value.slice(0, 15)
            }
          },
        }}
        rightElement={
          <Text fontSize="sm" whiteSpace="nowrap" position="absolute" left="50px" top="2">
            {t(`${prefix}.cooling.units`)}
          </Text>
        }
      />
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

      <Text as="p" mt={4} mb={2}>
        {t(`${prefix}.other`)}
        <TextFormControl fieldName="other" maxLength={310} />
      </Text>
      <Text as="p" mt={4} mb={2}>
        {t(`${prefix}.notes`)}
        <TextFormControl fieldName="notes" maxLength={190} />
      </Text>
      <Divider my={10} />
      <Box mb={6}>
        <Heading as="h3" size="md" mb={4} variant="yellowline">
          {t(`${prefix}.calculationPerformedBy.title`)}
        </Heading>
      </Box>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <TextFormControl
          required
          fieldName="calculationPerformedBy.name"
          label={t(`${prefix}.calculationPerformedBy.name`)}
          maxLength={50}
        />
        <Box>
          <HStack spacing={3} align="start">
            <Box flex={1}>
              <TextFormControl
                required
                fieldName="calculationPerformedBy.attestation"
                label={t(`${prefix}.calculationPerformedBy.attestation`)}
                maxLength={50}
              />
            </Box>
            <Button
              variant="outline"
              size="md"
              leftIcon={<AddressBook size={16} />}
              onClick={onContactsOpen}
              mt={8}
              alignSelf="start"
            >
              {t("ui.autofill")}
            </Button>
          </HStack>
          <Text as="p" mt={1} mb={2}>
            {t(`${prefix}.calculationPerformedBy.helpText`)}
          </Text>
        </Box>

        <TextFormControl
          required
          fieldName="calculationPerformedBy.address"
          label={t(`${prefix}.calculationPerformedBy.address`)}
          maxLength={50}
        />
        <TextFormControl
          required
          fieldName="calculationPerformedBy.company"
          label={t(`${prefix}.calculationPerformedBy.company`)}
          maxLength={50}
        />
        <TextFormControl
          required
          fieldName="calculationPerformedBy.city"
          label={t(`${prefix}.calculationPerformedBy.city`)}
          maxLength={50}
        />
        <TextFormControl
          required
          fieldName="calculationPerformedBy.postalCode"
          label={t(`${prefix}.calculationPerformedBy.postalCode`)}
          maxLength={50}
        />
        <PhoneFormControl
          required
          fieldName="calculationPerformedBy.phone"
          label={t(`${prefix}.calculationPerformedBy.phone`)}
        />
        <EmailFormControl
          required
          fieldName="calculationPerformedBy.email"
          label={t(`${prefix}.calculationPerformedBy.email`)}
        />
        <TextFormControl
          required
          fieldName="calculationPerformedBy.fax"
          label={t(`${prefix}.calculationPerformedBy.fax`)}
          maxLength={50}
        />
        <TextFormControl
          required
          fieldName="calculationPerformedBy.reference1"
          label={t(`${prefix}.calculationPerformedBy.reference1`)}
          maxLength={50}
        />
        <TextFormControl
          required
          fieldName="calculationPerformedBy.reference2"
          label={t(`${prefix}.calculationPerformedBy.reference2`)}
          maxLength={50}
        />
        <DatePickerFormControl
          label={t(`${prefix}.calculationPerformedBy.issuedForDate`)}
          fieldName={"calculationPerformedBy.issuedForDate"}
          showOptional={false}
          isReadOnly
        />
        <DatePickerFormControl
          label={t(`${prefix}.calculationPerformedBy.issuedForDate2`)}
          fieldName={"calculationPerformedBy.issuedForDate2"}
          showOptional={false}
          isReadOnly
        />
      </Grid>
      <Flex justify="flex-start" mt={10} mb={10}>
        <Button variant="primary" onClick={onNext}>
          {t(`${prefix}.calculationPerformedBy.next`)}
        </Button>
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
