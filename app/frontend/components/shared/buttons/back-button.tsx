import { Button, ButtonProps } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { useNavigate } from "react-router-dom"

interface IBackButton extends ButtonProps {}

export const BackButton = ({ ...rest }: IBackButton) => {
  const navigate = useNavigate()

  return (
    <Button variant="secondary" onClick={() => navigate(-1)} {...rest}>
      {t("ui.back")}
    </Button>
  )
}
