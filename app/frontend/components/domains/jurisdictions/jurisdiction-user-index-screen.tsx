import { Flex } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"

interface IJurisdictionIndexScreenProps {}

export const JurisdictionUserIndexScreen = observer(({}: IJurisdictionIndexScreenProps) => {
  const { t } = useTranslation()

  return (
    <Flex as="main" direction="column" w="full" bg="greys.white">
      jurisdictions user index
      <RouterLinkButton to={`invite`} variant="primary">
        {t("user.invite")}
      </RouterLinkButton>
    </Flex>
  )
})
