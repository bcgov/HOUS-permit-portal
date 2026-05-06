import { Box, Button, Flex, Grid, GridItem, Heading, Input, Link, Text, Textarea } from "@chakra-ui/react"
import { Envelope, Info, MapPin, Pencil, Phone } from "@phosphor-icons/react"
import React, { useState } from "react"
import { Control, Controller, ControllerFieldState, useFormContext, useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { EMAIL_REGEX } from "../../../constants"
import { TJurisdictionFieldValues } from "../../../types/types"
import { JURISDICTION_ABOUT_OFFICE_ADDRESS_MAX_CHARS } from "./jurisdiction-about-snippet-cards"

const OFFICE_HOURS_MAX = 500
const OFFICE_TELEPHONE_MAX = 128
const OFFICE_EMAIL_MAX = 255

export function contactInfoBannerHasContent(
  officeAddress?: string | null,
  officeHours?: string | null,
  officeTelephone?: string | null,
  officeEmail?: string | null
): boolean {
  return [officeAddress, officeHours, officeTelephone, officeEmail].some((v) => (v ?? "").trim().length > 0)
}

function fieldHasContent(value: unknown): boolean {
  return String(value ?? "").trim().length > 0
}

type TContactInfoFieldKey = "officeAddress" | "officeHours" | "officeTelephone" | "officeEmail"

function mapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`
}

function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "")
  return digits ? `tel:${digits}` : `tel:${phone}`
}

function getValidationRules(key: TContactInfoFieldKey, t: (k: string, opts?: Record<string, unknown>) => string) {
  const rules: Record<TContactInfoFieldKey, Record<string, unknown>> = {
    officeAddress: {
      maxLength: {
        value: JURISDICTION_ABOUT_OFFICE_ADDRESS_MAX_CHARS,
        message: t("jurisdiction.aboutSnippets.maxLengthOffice"),
      },
    },
    officeHours: {
      maxLength: {
        value: OFFICE_HOURS_MAX,
        message: t("jurisdiction.contactInfoBanner.maxLengthHours"),
      },
    },
    officeTelephone: {
      maxLength: {
        value: OFFICE_TELEPHONE_MAX,
        message: t("ui.invalidInput"),
      },
      validate: {
        satisfiesLength: (str: string) =>
          !str || (str.length >= 1 && str.length <= OFFICE_TELEPHONE_MAX) || t("ui.invalidInput"),
      },
    },
    officeEmail: {
      maxLength: {
        value: OFFICE_EMAIL_MAX,
        message: t("jurisdiction.contactInfoBanner.maxLengthEmail"),
      },
      validate: {
        matchesEmailRegex: (str: string) => !str?.trim() || EMAIL_REGEX.test(str) || t("ui.invalidEmail"),
      },
    },
  }
  return rules[key]
}

const INPUT_MAX_LENGTH: Partial<Record<TContactInfoFieldKey, number>> = {
  officeTelephone: OFFICE_TELEPHONE_MAX,
  officeEmail: OFFICE_EMAIL_MAX,
}

function EditField({
  fieldKey,
  label,
  text,
  onChange,
  fieldState,
}: {
  fieldKey: TContactInfoFieldKey
  label: string
  text: string
  onChange: (value: string) => void
  fieldState: ControllerFieldState
}) {
  const errorBorderColor = fieldState.error ? "semantic.error" : "border.light"

  const errorMessage = fieldState.error?.message ? (
    <Text fontSize="xs" color="semantic.error" role="alert">
      {fieldState.error.message}
    </Text>
  ) : null

  if (fieldKey === "officeAddress") {
    return (
      <>
        <Textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          fontSize="sm"
          bg="greys.white"
          borderColor={errorBorderColor}
          h={10}
          minH={10}
          maxH={10}
          py={2}
          resize="none"
          overflowY="auto"
          whiteSpace="pre-wrap"
          wordBreak="break-word"
          aria-label={label}
          aria-invalid={!!fieldState.error}
        />
        {errorMessage}
      </>
    )
  }

  return (
    <>
      <Input
        value={text}
        onChange={(e) => onChange(e.target.value)}
        type="text"
        maxLength={INPUT_MAX_LENGTH[fieldKey]}
        fontSize="sm"
        bg="greys.white"
        borderColor={errorBorderColor}
        aria-label={label}
        aria-invalid={!!fieldState.error}
      />
      {errorMessage}
    </>
  )
}

interface IJurisdictionContactInfoBannerProps {
  control: Control<TJurisdictionFieldValues>
  canManage: boolean
  qualifiedName: string
}

export function JurisdictionContactInfoBanner({
  control,
  canManage,
  qualifiedName,
}: IJurisdictionContactInfoBannerProps) {
  const { t } = useTranslation()
  const { trigger } = useFormContext<TJurisdictionFieldValues>()
  const [isEditing, setIsEditing] = useState(false)

  const [officeAddress, officeHours, officeTelephone, officeEmail] = useWatch({
    control,
    name: ["officeAddress", "officeHours", "officeTelephone", "officeEmail"],
  })

  const hasPublicContent = contactInfoBannerHasContent(officeAddress, officeHours, officeTelephone, officeEmail)
  if (!canManage && !hasPublicContent) {
    return null
  }

  const columns: {
    key: TContactInfoFieldKey
    label: string
    Icon: typeof MapPin
  }[] = [
    { key: "officeAddress", label: t("jurisdiction.contactInfoBanner.officeAddress"), Icon: MapPin },
    { key: "officeHours", label: t("jurisdiction.contactInfoBanner.officeHours"), Icon: Info },
    { key: "officeTelephone", label: t("jurisdiction.contactInfoBanner.telephone"), Icon: Phone },
    { key: "officeEmail", label: t("jurisdiction.contactInfoBanner.email"), Icon: Envelope },
  ]

  const fieldValues: Record<TContactInfoFieldKey, unknown> = {
    officeAddress,
    officeHours,
    officeTelephone,
    officeEmail,
  }

  const visibleColumns = canManage ? columns : columns.filter((column) => fieldHasContent(fieldValues[column.key]))

  if (!canManage && visibleColumns.length === 0) {
    return null
  }

  const visibleCount = visibleColumns.length
  const gridTemplateColumns = {
    base: "1fr",
    md: visibleCount <= 1 ? "1fr" : "repeat(2, 1fr)",
    xl: `repeat(${Math.min(visibleCount, 4)}, 1fr)`,
  } as const

  return (
    <Box
      display="flex"
      flexDirection="column"
      w="full"
      {...(canManage
        ? {
            border: "1px dashed",
            borderColor: "border.light",
            p: 1,
            gap: 1,
          }
        : {})}
    >
      {canManage && (
        <Flex justify="flex-end" w="full">
          <Button
            variant="primary"
            size="xs"
            aria-label={isEditing ? t("ui.done") : t("ui.edit")}
            onClick={async () => {
              if (isEditing) {
                const valid = await trigger(["officeAddress", "officeHours", "officeTelephone", "officeEmail"])
                if (valid) setIsEditing(false)
              } else {
                setIsEditing(true)
              }
            }}
          >
            <Pencil size={12} />
            {isEditing ? t("ui.done") : t("ui.edit")}
          </Button>
        </Flex>
      )}
      <Flex direction="column" gap={4} w="full" bgColor="greys.grey10" py={4} px={6}>
        <Heading as="h3" fontSize="md" fontWeight="bold" color="text.primary" w="full" mb={0}>
          {qualifiedName}
        </Heading>

        <Grid templateColumns={gridTemplateColumns} gap={4} w="full">
          {visibleColumns.map(({ key, label, Icon }) => (
            <GridItem key={key} minW={0}>
              <Controller
                name={key}
                control={control}
                rules={getValidationRules(key, t)}
                render={({ field: { value, onChange }, fieldState }) => {
                  const text = typeof value === "string" ? value : ""
                  const showFields = canManage && isEditing

                  return (
                    <Flex gap={4} align="flex-start" minH={8} minW={0}>
                      <Flex
                        align="center"
                        justify="center"
                        w={8}
                        h={8}
                        borderRadius="full"
                        bg="theme.blueAlt"
                        flexShrink={0}
                      >
                        <Icon size={16} color="white" />
                      </Flex>
                      <Flex direction="column" flex={1} minW={0}>
                        <Text fontWeight="bold" color="text.primary">
                          {label}
                        </Text>
                        {showFields ? (
                          <EditField
                            fieldKey={key}
                            label={label}
                            text={text}
                            onChange={onChange}
                            fieldState={fieldState}
                          />
                        ) : (
                          <DisplayValue
                            fieldKey={key}
                            text={text}
                            emptyHint={canManage ? t("jurisdiction.contactInfoBanner.emptyHint") : ""}
                          />
                        )}
                      </Flex>
                    </Flex>
                  )
                }}
              />
            </GridItem>
          ))}
        </Grid>
      </Flex>
    </Box>
  )
}

function DisplayValue({
  fieldKey,
  text,
  emptyHint,
}: {
  fieldKey: TContactInfoFieldKey
  text: string
  emptyHint: string
}) {
  const trimmed = text.trim()
  if (!trimmed) {
    return (
      <Text fontSize="sm" color="text.secondary">
        {emptyHint}
      </Text>
    )
  }

  if (fieldKey === "officeAddress") {
    return (
      <Link
        href={mapsSearchUrl(trimmed)}
        color="text.link"
        textDecoration="underline"
        fontSize="sm"
        whiteSpace="pre-wrap"
        wordBreak="break-word"
        _hover={{ textDecoration: "none" }}
        target="_blank"
        rel="noopener noreferrer"
      >
        {text}
      </Link>
    )
  }

  if (fieldKey === "officeTelephone") {
    return (
      <Link
        href={telHref(trimmed)}
        color="text.link"
        textDecoration="underline"
        fontSize="sm"
        whiteSpace="pre-wrap"
        wordBreak="break-word"
        _hover={{ textDecoration: "none" }}
      >
        {text}
      </Link>
    )
  }

  if (fieldKey === "officeEmail") {
    return (
      <Link
        href={`mailto:${trimmed}`}
        color="text.link"
        textDecoration="underline"
        fontSize="sm"
        whiteSpace="pre-wrap"
        wordBreak="break-word"
        _hover={{ textDecoration: "none" }}
      >
        {text}
      </Link>
    )
  }

  return (
    <Text
      as="span"
      fontSize="sm"
      color="text.link"
      textDecoration="underline"
      whiteSpace="pre-wrap"
      wordBreak="break-word"
    >
      {text}
    </Text>
  )
}
