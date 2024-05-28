import { Button, Divider, Flex, Heading, Link, Text, VStack } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { BasicBCeIDInfo } from "../../shared/bceid/basic"
import { BusinessBCeIDInfo } from "../../shared/bceid/business"
import { CenterContainer } from "../../shared/containers/center-container"
import { HelpDrawer } from "../../shared/help-drawer"

interface ILoginScreenProps {
  isAdmin?: boolean
}

export const LoginScreen = ({ isAdmin }: ILoginScreenProps) => {
  const { t } = useTranslation()

  return (
    <CenterContainer h="full">
      <Flex
        direction="column"
        maxW="500px"
        gap={6}
        w="full"
        flex={1}
        p={10}
        border="solid 1px"
        borderColor="border.light"
        bg="greys.white"
      >
        <VStack spacing={2} align="start">
          <Heading as="h1" mb={0}>
            {isAdmin ? t("auth.adminLogin") : t("auth.login")}
          </Heading>
          {!isAdmin && <Text fontSize="md">{t("auth.prompt")}</Text>}
        </VStack>
        <form action="/api/auth/keycloak" method="post">
          <input type="hidden" name="kc_idp_hint" value={isAdmin ? "idir" : "bceidboth"} />
          {/* @ts-ignore */}
          <input type="hidden" name="authenticity_token" value={document.querySelector("[name=csrf-token]").content} />
          <Button variant="primary" w="full" type="submit">
            {isAdmin ? t("auth.idir_login") : t("auth.bceid_login")}
          </Button>
        </form>
        {isAdmin ? (
          <Text>{t("auth.adminAccountAccess")}</Text>
        ) : (
          <>
            <Text>
              {t("auth.loginHelp")}
              <Link href="https://www.bceid.ca/clp/account_recovery.aspx" isExternal>
                {t("ui.clickHere")}
              </Link>
            </Text>
            <Divider my={4} />
            <Heading as="h2" m={0}>
              {t("auth.bceidInfo.heading")}
            </Heading>

            <BasicBCeIDInfo />
            <BusinessBCeIDInfo />

            <HelpDrawer
              renderTriggerButton={({ onClick }) => (
                <Button variant="link" onClick={onClick}>
                  {t("ui.help")}
                </Button>
              )}
            />
          </>
        )}
      </Flex>
    </CenterContainer>
  )
}
