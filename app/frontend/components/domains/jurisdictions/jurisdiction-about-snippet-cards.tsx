import { Box, Button, Flex, SimpleGrid, Text, Textarea } from "@chakra-ui/react"
import { Clock, ListBullets, MapPin, Pencil } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { Control, Controller, useFormContext, useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { TJurisdictionFieldValues } from "../../../types/types"

export const JURISDICTION_ABOUT_TWO_LINE_MAX_CHARS = 140

export const JURISDICTION_ABOUT_OFFICE_ADDRESS_MAX_CHARS = 500

export function jurisdictionAboutSnippetHasContent(
  processingTimeHtml?: string | null,
  keyStagesHtml?: string | null,
  officeAddress?: string | null
): boolean {
  return [processingTimeHtml, keyStagesHtml, officeAddress].some((v) => (v ?? "").trim().length > 0)
}

type TSnippetFieldName = "processingTimeHtml" | "keyStagesHtml" | "officeAddress"

type TEditableSnippetFieldName = "processingTimeHtml" | "keyStagesHtml"

interface IJurisdictionAboutSnippetCardsProps {
  control: Control<TJurisdictionFieldValues>
  canManage: boolean
}

const EDIT_ROW_MIN_H = 6
const SNIPPET_CARD_MIN_H = "106px"

const SNIPPET_FIELD_ORDER = ["processingTimeHtml", "keyStagesHtml", "officeAddress"] as const

function snippetFieldHasVisibleText(value: unknown): boolean {
  return String(value ?? "").trim().length > 0
}

function OfficeAddressSnippetCard({
  control,
  canManage,
}: {
  control: Control<TJurisdictionFieldValues>
  canManage: boolean
}) {
  const { t } = useTranslation()
  const value = useWatch({ control, name: "officeAddress" })
  const text = typeof value === "string" ? value : ""
  const Icon = MapPin

  return (
    <Box
      border={canManage ? "1px dashed" : "none"}
      borderColor={canManage ? "border.light" : undefined}
      p={canManage ? 1 : 0}
      w="full"
      h="full"
      minW={0}
      display="flex"
      flexDirection="column"
    >
      <Flex direction="column" gap={1} flex={1} minH={0} minW={0}>
        {canManage && <Flex justify="flex-end" align="center" minH={EDIT_ROW_MIN_H} flexShrink={0} />}
        <Box bg="theme.blueLight" borderRadius="md" p={4} minH={SNIPPET_CARD_MIN_H} flex={1} role="group">
          <Flex gap={4} align="flex-start">
            <Icon size={32} color="var(--chakra-colors-theme-blueAlt)" weight="regular" />
            <Flex direction="column" py={1} flex={1} minW={0}>
              <Text fontWeight="bold" color="theme.blueAlt" fontSize="md">
                {t("jurisdiction.aboutSnippets.officeAddressTitle")}
              </Text>
              <Text fontSize="md" color="theme.blueAlt" whiteSpace="pre-wrap">
                {text.trim() ? text : ""}
              </Text>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Box>
  )
}

export const JurisdictionAboutSnippetCards = observer(({ control, canManage }: IJurisdictionAboutSnippetCardsProps) => {
  const { t } = useTranslation()
  const { trigger, getValues } = useFormContext()
  const [editingField, setEditingField] = useState<TEditableSnippetFieldName | null>(null)
  const watchedSnippets = useWatch({
    control,
    name: ["processingTimeHtml", "keyStagesHtml", "officeAddress"],
  })

  const snippetValues = Array.isArray(watchedSnippets)
    ? watchedSnippets
    : [getValues("processingTimeHtml"), getValues("keyStagesHtml"), getValues("officeAddress")]

  const visibleFields = SNIPPET_FIELD_ORDER.filter((_, i) => {
    if (canManage) return true
    return snippetFieldHasVisibleText(snippetValues[i])
  })

  if (visibleFields.length === 0) {
    return null
  }

  const titles: Record<TSnippetFieldName, string> = {
    processingTimeHtml: t("jurisdiction.aboutSnippets.processingTimeTitle"),
    keyStagesHtml: t("jurisdiction.aboutSnippets.keyStagesTitle"),
    officeAddress: t("jurisdiction.aboutSnippets.officeAddressTitle"),
  }

  const icons = {
    processingTimeHtml: Clock,
    keyStagesHtml: ListBullets,
    officeAddress: MapPin,
  }

  const maxLen: Record<TEditableSnippetFieldName, number> = {
    processingTimeHtml: JURISDICTION_ABOUT_TWO_LINE_MAX_CHARS,
    keyStagesHtml: JURISDICTION_ABOUT_TWO_LINE_MAX_CHARS,
  }

  const lineClamp: Partial<Record<TSnippetFieldName, number>> = {
    processingTimeHtml: 2,
    keyStagesHtml: 2,
  }

  return (
    <SimpleGrid columns={{ base: 1, md: Math.min(visibleFields.length, 3) }} spacing={6} w="full" alignItems="stretch">
      {visibleFields.map((fieldName) => {
        if (fieldName === "officeAddress") {
          return <OfficeAddressSnippetCard key={fieldName} control={control} canManage={canManage} />
        }

        const Icon = icons[fieldName]
        const canEditHere = canManage

        return (
          <Controller
            key={fieldName}
            name={fieldName}
            control={control}
            rules={{
              maxLength: {
                value: JURISDICTION_ABOUT_TWO_LINE_MAX_CHARS,
                message: t("jurisdiction.aboutSnippets.maxLengthTwoLines", {
                  max: JURISDICTION_ABOUT_TWO_LINE_MAX_CHARS,
                }),
              },
            }}
            render={({ field: { value, onChange }, fieldState }) => {
              const text = typeof value === "string" ? value : ""
              const isEditing = editingField === fieldName

              return (
                <Box
                  border={canManage ? "1px dashed" : "none"}
                  borderColor={canManage ? "border.light" : undefined}
                  p={canManage ? 1 : 0}
                  w="full"
                  h="full"
                  minW={0}
                  display="flex"
                  flexDirection="column"
                >
                  <Flex direction="column" gap={1} flex={1} minH={0} minW={0}>
                    {canManage && (
                      <Flex justify="flex-end" align="center" minH={EDIT_ROW_MIN_H} flexShrink={0}>
                        <Button
                          variant="primary"
                          size="xs"
                          leftIcon={<Pencil size={12} />}
                          aria-label={isEditing ? t("ui.done") : t("ui.edit")}
                          onClick={async () => {
                            if (isEditing) {
                              const valid = await trigger(fieldName)
                              if (valid) setEditingField(null)
                            } else {
                              setEditingField(fieldName as TEditableSnippetFieldName)
                            }
                          }}
                        >
                          {isEditing ? t("ui.done") : t("ui.edit")}
                        </Button>
                      </Flex>
                    )}
                    <Box bg="theme.blueLight" borderRadius="md" p={4} minH={SNIPPET_CARD_MIN_H} flex={1} role="group">
                      <Flex gap={4} align="flex-start">
                        <Icon size={32} color="var(--chakra-colors-theme-blueAlt)" weight="regular" />
                        <Flex direction="column" py={1} flex={1} minW={0}>
                          <Text fontWeight="bold" color="theme.blueAlt" fontSize="md">
                            {titles[fieldName]}
                          </Text>
                          {canEditHere && isEditing ? (
                            <>
                              <Textarea
                                value={text}
                                onChange={(e) => onChange(e.target.value)}
                                rows={2}
                                maxLength={maxLen[fieldName as TEditableSnippetFieldName]}
                                resize="none"
                                fontSize="sm"
                                bg="greys.white"
                                borderColor={fieldState.error ? "semantic.error" : "border.light"}
                                _focusVisible={{ borderColor: "theme.blueAlt" }}
                                placeholder={t("jurisdiction.aboutSnippets.placeholder")}
                                aria-label={titles[fieldName]}
                                aria-invalid={!!fieldState.error}
                              />
                              {fieldState.error?.message ? (
                                <Text fontSize="xs" color="semantic.error" role="alert">
                                  {fieldState.error.message}
                                </Text>
                              ) : null}
                            </>
                          ) : (
                            <Text
                              fontSize="md"
                              color="theme.blueAlt"
                              {...(lineClamp[fieldName] != null ? { noOfLines: lineClamp[fieldName] } : {})}
                              whiteSpace="pre-wrap"
                            >
                              {text.trim() ? text : canManage ? t("jurisdiction.aboutSnippets.emptyHint") : ""}
                            </Text>
                          )}
                        </Flex>
                      </Flex>
                    </Box>
                  </Flex>
                </Box>
              )
            }}
          />
        )
      })}
    </SimpleGrid>
  )
})
