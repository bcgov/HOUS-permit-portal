import { Container } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IHomeScreenProps } from "."
import { useMst } from "../../../setup/root"
import { RequirementForm } from "../../shared/permit-applications/requirement-form"

export const SubmitterHomeScreen = observer(({ ...rest }: IHomeScreenProps) => {
  const { t } = useTranslation()
  const {} = useMst()

  return (
    <Container>
      <div>submitter home</div>
      <RequirementForm />
    </Container>
  )
})
