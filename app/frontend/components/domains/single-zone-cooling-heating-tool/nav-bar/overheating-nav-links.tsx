import { Button, HStack } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

export const OverheatingNavLinks = function OverheatingNavLinks() {
  const navigate = useNavigate()
  const { t } = useTranslation() as any
  const handleBack = async () => {
    navigate(-1)
  }

  return (
    <HStack>
      <Button variant="secondary" onClick={handleBack}>
        {t("ui.back")}
      </Button>
    </HStack>
  )
}
