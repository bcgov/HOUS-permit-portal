import { Box, Button, Flex, Link, Text } from "@chakra-ui/react"
import { CaretLeft, Pencil } from "@phosphor-icons/react"
import React, { useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { TJurisdictionFieldValues } from "../../../types/types"
import { UrlFormControl } from "../../shared/form/input-form-control"

function HeroLgBackToWebsiteLink({ href, jurisdictionName }: { href: string; jurisdictionName: string }) {
  const { t } = useTranslation()
  return (
    <Link
      href={href}
      isExternal
      display="flex"
      alignItems="center"
      gap={2}
      w="full"
      minW={0}
      color="greys.white"
      fontSize="sm"
      lineHeight="shorter"
      textDecoration="none"
      _hover={{ color: "greys.white", textDecoration: "underline" }}
    >
      <Box as="span" display="inline-flex" flexShrink={0} lineHeight={1} aria-hidden>
        <CaretLeft size={14} weight="bold" color="currentColor" />
      </Box>
      <Text as="span" flex="1" minW={0}>
        {t("jurisdiction.lgWebsiteBackLink", { jurisdictionName })}
      </Text>
    </Link>
  )
}

export function JurisdictionHeroLgWebsiteRow({
  canManageAbout,
  jurisdictionName,
  persistedWebsiteUrl = "",
}: {
  canManageAbout: boolean
  jurisdictionName: string
  persistedWebsiteUrl?: string
}) {
  const { t } = useTranslation()
  const { watch, trigger, formState } = useFormContext<TJurisdictionFieldValues>()
  const { errors } = formState
  const [isEditingWebsite, setIsEditingWebsite] = useState(false)
  const websiteUrlError = errors.websiteUrl
  const watchedUrl = watch("websiteUrl")
  const watchedTrimmed = typeof watchedUrl === "string" ? watchedUrl.trim() : ""
  const persistedTrimmed = (persistedWebsiteUrl ?? "").trim()
  const websiteUrl = isEditingWebsite ? watchedTrimmed : watchedTrimmed || persistedTrimmed
  const showRow = websiteUrl.length > 0 || canManageAbout

  if (!showRow) return null

  if (!canManageAbout) {
    return (
      <Box minH={6} w="full" minW={0}>
        <HeroLgBackToWebsiteLink href={websiteUrl} jurisdictionName={jurisdictionName} />
      </Box>
    )
  }

  return (
    <Box w="full" minH={6} minW={0} pb={isEditingWebsite && websiteUrlError ? 7 : 0}>
      <Flex align="center" gap={3} w="full" minW={0}>
        <Box flex="1" minW={0}>
          {isEditingWebsite ? (
            <UrlFormControl
              fieldName="websiteUrl"
              sx={{
                position: "relative",
                "& .chakra-form__error-message, & [role='alert']": {
                  position: "absolute",
                  left: 0,
                  top: "100%",
                  mt: 1,
                  width: "100%",
                  maxW: "md",
                  color: "greys.white",
                },
              }}
              inputProps={{
                placeholder: t("jurisdiction.lgWebsiteUrlPlaceholder"),
                "aria-label": t("jurisdiction.lgWebsiteUrlLabel"),
                bg: "greys.white",
                color: "text.primary",
                borderColor: "border.light",
                _focusVisible: { borderColor: "theme.blueAlt", boxShadow: "none" },
                size: "sm",
                maxW: "md",
              }}
            />
          ) : websiteUrl ? (
            <HeroLgBackToWebsiteLink href={websiteUrl} jurisdictionName={jurisdictionName} />
          ) : (
            <Text fontSize="sm" color="greys.white">
              {t("jurisdiction.lgWebsiteEmptyManagerHint")}
            </Text>
          )}
        </Box>
        <Button
          flexShrink={0}
          variant="primary"
          size="xs"
          leftIcon={<Pencil size={12} />}
          aria-label={isEditingWebsite ? t("ui.done") : t("ui.edit")}
          onClick={async () => {
            if (isEditingWebsite) {
              const valid = await trigger("websiteUrl")
              if (valid) setIsEditingWebsite(false)
            } else {
              setIsEditingWebsite(true)
            }
          }}
        >
          {isEditingWebsite ? t("ui.done") : t("ui.edit")}
        </Button>
      </Flex>
    </Box>
  )
}
