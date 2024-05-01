import { Button, Divider, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import React from "react"
import { Trans, useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { BusinessBCeIDInfo } from "../../shared/bceid/business"
import { CenterContainer } from "../../shared/containers/center-container"
import { HelpDrawer } from "../../shared/help-drawer"

interface IAcceptInvitationScreenProps {}

export const AcceptInvitationScreen = ({}: IAcceptInvitationScreenProps) => {
  const { t } = useTranslation()

  const [searchParams] = useSearchParams()
  const user = JSON.parse(decodeURIComponent(searchParams.get("user")))
  const jurisdictionName = searchParams.get("jurisdiction_name")
  const invitedByEmail = searchParams.get("invited_by_email")
  const role = searchParams.get("role")

  return (
    <CenterContainer>
      <Flex
        direction="column"
        gap={6}
        maxW="500px"
        p={10}
        border="solid 1px"
        borderColor="border.light"
        bg="greys.white"
      >
        <Heading as="h1">{t("user.acceptInvitation")}</Heading>
        <Text>
          <Trans i18nKey="user.invitedBy" values={{ email: invitedByEmail }} />
        </Text>
        <VStack spacing={4} w="full" p={4} bg="theme.blueLight" rounded="sm">
          <Heading as="h2" m={0}>
            {jurisdictionName}
          </Heading>
          <Text>{t("user.invitedAs")}</Text>
          <Text fontWeight="bold">{role}</Text>
        </VStack>

        <Text fontStyle="italic" fontSize="sm" textAlign="center">
          <Trans i18nKey="user.invitationIntent" values={{ email: user.email }} />
        </Text>

        <Divider my={4} />

        <Heading as="h3" textAlign="center">
          {t("user.createAccount")}
        </Heading>
        <form action={`/api/auth/keycloak`} method="post">
          <input type="hidden" name="kc_idp_hint" value="bceidboth" />
          <input type="hidden" name="authenticity_token" value={document.querySelector("[name=csrf-token]").content} />
          <Button variant="primary" w="full" type="submit">
            {t("auth.bceid_login")}
          </Button>
        </form>

        <Divider my={4} />

        <BusinessBCeIDInfo />

        <HelpDrawer
          renderTriggerButton={({ onClick }) => (
            <Button variant="link" onClick={onClick}>
              {t("ui.help")}
            </Button>
          )}
        />
      </Flex>
    </CenterContainer>
  )
}
