import { Button, Flex, Heading } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { CenterContainer } from "../../shared/containers/center-container"

interface ILoginScreenProps {}

export const LoginScreen = ({}: ILoginScreenProps) => {
  const { t } = useTranslation()

  return (
    <CenterContainer>
      <Flex direction="column" gap={6} w="full" p={10} border="solid 1px" borderColor="border.light" bg="greys.white">
        <Heading as="h1">{t("auth.login")}</Heading>
        <form action="/api/auth/keycloak" method="post">
          {/* @ts-ignore */}
          <input type="hidden" name="kc_idp_hint" value="bceidboth" />
          <input type="hidden" name="authenticity_token" value={document.querySelector("[name=csrf-token]").content} />
          <Button variant="primary" w="full" type="submit">
            {t("auth.bceid_login")}
          </Button>
        </form>
      </Flex>
    </CenterContainer>
  )
}
