import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  HStack,
  Input,
  Tag,
  Text,
} from "@chakra-ui/react"
import { CheckCircle, Hourglass, Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { FormEvent, useState } from "react"
import { useTranslation } from "react-i18next"
import { EMAIL_REGEX } from "../../../../../../constants"
import { IJurisdiction } from "../../../../../../models/jurisdiction"
import { ESubmissionContactClass } from "../../../../../../types/enums"
import { ISubmissionContact } from "../../../../../../types/types"

interface ISubmissionContactFormProps {
  jurisdiction: IJurisdiction
  contactClass: ESubmissionContactClass
}

const i18nPrefix = "home.configurationManagement.submissionContacts"

function parseEmails(value: string): string[] {
  const seen = new Set<string>()
  const emails: string[] = []

  for (const part of value.split(",")) {
    const email = part.trim()
    const key = email.toLowerCase()
    if (!email || seen.has(key)) continue

    seen.add(key)
    emails.push(email)
  }

  return emails
}

const ContactStatusTag = ({ confirmed }: { confirmed: boolean }) => {
  const { t } = useTranslation()
  const color = confirmed ? "semantic.success" : "semantic.info"
  const Icon = confirmed ? CheckCircle : Hourglass

  return (
    <Tag
      size="sm"
      bg={confirmed ? "semantic.successLight" : "semantic.infoLight"}
      color={color}
      border="1px solid"
      borderColor={color}
      fontWeight="medium"
      gap={1}
      flexShrink={0}
    >
      <Icon size={14} weight="fill" />
      {t(`${i18nPrefix}.${confirmed ? "verified" : "verificationPending"}`)}
    </Tag>
  )
}

export const SubmissionContactForm = observer(function SubmissionContactForm({
  jurisdiction,
  contactClass,
}: ISubmissionContactFormProps) {
  const { t } = useTranslation()
  const contacts = jurisdiction.submissionContacts.filter((contact) => contact.type === contactClass)
  const [isAdding, setIsAdding] = useState(false)
  const [emailInput, setEmailInput] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [busy, setBusy] = useState<{ id: string; action: "resend" | "remove" } | null>(null)

  const resetAdd = () => {
    setIsAdding(false)
    setEmailInput("")
    setEmailError(null)
  }

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault()
    const emails = parseEmails(emailInput)
    if (emails.length === 0 || emails.some((email) => !EMAIL_REGEX.test(email))) {
      setEmailError(t("ui.invalidEmail"))
      return
    }

    setEmailError(null)
    setIsSubmitting(true)
    const remaining = [...emails]
    for (const email of emails) {
      const created = await jurisdiction.createSubmissionContact(email, contactClass)
      if (!created) break
      remaining.shift()
    }
    setIsSubmitting(false)

    if (remaining.length === 0) {
      resetAdd()
    } else {
      setEmailInput(remaining.join(", "))
    }
  }

  const handleRemove = async (contact: ISubmissionContact) => {
    setBusy({ id: contact.id, action: "remove" })
    await jurisdiction.destroySubmissionContact(contact.id)
    setBusy(null)
  }

  const handleResend = async (contact: ISubmissionContact) => {
    setBusy({ id: contact.id, action: "resend" })
    await jurisdiction.resendSubmissionContactConfirmation(contact.id)
    setBusy(null)
  }

  return (
    <Flex direction="column" w="full" align="stretch">
      <Grid templateColumns="minmax(0, 1fr) auto minmax(0, 1fr)" columnGap={4} w="full">
        {contacts.map((contact) => {
          const confirmed = Boolean(contact.confirmedAt)
          const isBusy = busy?.id === contact.id

          return (
            <Grid
              key={contact.id}
              gridColumn="1 / -1"
              templateColumns="subgrid"
              alignItems="center"
              py={3}
              borderBottomWidth="1px"
              borderColor="border.light"
            >
              <Text fontWeight="medium" noOfLines={1}>
                {contact.email}
              </Text>
              <Box justifySelf="start">
                <ContactStatusTag confirmed={confirmed} />
              </Box>
              <HStack spacing={4} justify="flex-end">
                {!confirmed && (
                  <Button
                    variant="link"
                    onClick={() => handleResend(contact)}
                    isLoading={isBusy && busy?.action === "resend"}
                    isDisabled={isBusy}
                  >
                    {t(`${i18nPrefix}.resend`)}
                  </Button>
                )}
                <Button
                  variant="link"
                  onClick={() => handleRemove(contact)}
                  isLoading={isBusy && busy?.action === "remove"}
                  isDisabled={isBusy}
                >
                  {t(`${i18nPrefix}.remove`)}
                </Button>
              </HStack>
            </Grid>
          )
        })}
      </Grid>

      {isAdding ? (
        <Box as="form" onSubmit={handleAdd} bg="semantic.infoLight" p={4} mt={4} borderRadius="md">
          <FormControl isInvalid={Boolean(emailError)}>
            <FormLabel>{t(`${i18nPrefix}.emailLabel`)}</FormLabel>
            <Input
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              bg="white"
              maxW="sm"
              isDisabled={isSubmitting}
            />
            {emailError ? (
              <FormHelperText color="semantic.error">{emailError}</FormHelperText>
            ) : (
              <FormHelperText>{t(`${i18nPrefix}.emailHelper`)}</FormHelperText>
            )}
          </FormControl>
          <HStack mt={4}>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              {t(`${i18nPrefix}.addEmail`)}
            </Button>
            <Button variant="secondary" type="button" onClick={resetAdd} isDisabled={isSubmitting}>
              {t("ui.cancel")}
            </Button>
          </HStack>
        </Box>
      ) : (
        <Button variant="link" alignSelf="flex-start" leftIcon={<Plus />} mt={3} onClick={() => setIsAdding(true)}>
          {t(`${i18nPrefix}.addEmail`)}
        </Button>
      )}
    </Flex>
  )
})
