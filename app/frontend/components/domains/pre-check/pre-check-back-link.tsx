import { Icon, Link } from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { usePreCheckNavigation } from "./use-pre-check-navigation"

export const PreCheckBackLink = observer(function PreCheckBackLink() {
  const { t } = useTranslation()
  const { navigateToPrevious, hasPrevious } = usePreCheckNavigation()

  if (!hasPrevious) return null

  return (
    <Link
      onClick={navigateToPrevious}
      color="text.link"
      display="flex"
      alignItems="center"
      gap={1}
      mb={6}
      _hover={{ textDecoration: "underline" }}
      cursor="pointer"
    >
      <Icon as={CaretLeft} boxSize={4} />
      {t("ui.back", "Back")}
    </Link>
  )
})
