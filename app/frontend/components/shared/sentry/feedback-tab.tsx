import { Button, Portal } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { feedbackController } from "../../../services/observability"
import { brand } from "../../../styles/brand"

export function FeedbackTab() {
  const { t } = useTranslation()
  if (!feedbackController.enabled) return null
  return (
    <Portal>
      <Button
        position="fixed"
        right={0}
        top="50%"
        transform="translateY(-50%)"
        zIndex="sticky"
        variant="unstyled"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        bg={brand.blue}
        color="white"
        borderRadius="8px 0 0 8px"
        minW="44px"
        w="44px"
        h="112px"
        p={0}
        fontFamily={`${brand.fontFamily}, sans-serif`}
        fontSize="14px"
        fontWeight="semibold"
        lineHeight={1}
        _hover={{ bg: brand.blue, filter: "brightness(1.15)" }}
        _active={{ filter: "brightness(0.9)" }}
        _focusVisible={{ outline: `3px solid ${brand.yellow}`, outlineOffset: "2px", boxShadow: "none" }}
        sx={{ writingMode: "vertical-rl" }}
        aria-haspopup="dialog"
        onClick={() => {
          void feedbackController.open("side_tab")
        }}
      >
        {t("sentry.tab")}
      </Button>
    </Portal>
  )
}
