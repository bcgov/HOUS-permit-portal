import { Button, Divider, Flex, Grid, GridItem, Heading, Link, Text } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { OMNIAUTH_PROVIDERS } from "../../../models/user"
import { CenterContainer } from "../../shared/containers/center-container"
import { HelpDrawer } from "../../shared/help-drawer"
import { BasicBCeIDInfo } from "../../shared/keycloak/basicbceid"
import { BCSCInfo } from "../../shared/keycloak/bcsc-info"
import { BusinessBCeIDInfo } from "../../shared/keycloak/businessbceid"

interface ILoginScreenProps {
  isAdmin?: boolean
}

export const LoginScreen = ({ isAdmin }: ILoginScreenProps) => {
  const { t } = useTranslation()
  // const isMdOrLarger = useBreakpointValue({ base: false, md: true })

  return (
    <CenterContainer h="full" maxW={isAdmin ? "container.md" : "container.lg"}>
      <Flex
        direction="column"
        gap={6}
        w="full"
        flex={1}
        p={12}
        border="solid 1px"
        borderColor="border.light"
        bg="greys.white"
      >
        <Heading as="h1">{t("auth.loginTitle")}</Heading>

        {/* Replace VStack with Flex */}
        <Flex direction="column" flex={1}>
          {isAdmin ? (
            <>
              <Heading as="h2">{t("auth.adminLogin")}</Heading>
              <IdirLoginForm />
            </>
          ) : (
            <Grid
              templateColumns={{ base: "1fr", md: "1fr auto 1fr" }} // Single column on small screens, three columns on md and up
              gap={6}
              width="100%"
              padding={4}
              alignItems="start"
            >
              <GridItem>
                <Heading as="h2">{t("auth.publicLogin")}</Heading>
              </GridItem>

              <GridItem rowSpan={7} h="full">
                <Divider orientation="vertical" height="100%" borderColor="border.light" mx={12} />
              </GridItem>

              <GridItem>
                <Heading as="h2">{t("auth.localGovLogin")}</Heading>
              </GridItem>

              <GridItem>
                <Text>{t("auth.publicLoginDescription")}</Text>
              </GridItem>

              <GridItem>
                <Text>{t("auth.localGovLoginDescription")}</Text>
              </GridItem>

              <GridItem>
                <Flex direction="column" gap={6}>
                  <BcscLoginForm />
                  <BceidLoginForm />
                </Flex>
              </GridItem>

              <GridItem>
                <BceidLoginForm />
              </GridItem>

              <GridItem>
                <Divider my={4} borderColor="border.light" />
              </GridItem>

              <GridItem>
                <Divider my={4} borderColor="border.light" />
              </GridItem>

              <GridItem>
                <Heading as="h2">{t("auth.chooseLogin")}</Heading>
                <Text>{t("auth.matchLogin")}</Text>
              </GridItem>

              <GridItem>
                <Heading as="h2">{t("auth.chooseLogin")}</Heading>
                <Text>{t("auth.matchLogin")}</Text>
              </GridItem>

              <GridItem>
                <Flex direction="column" gap={6}>
                  <BasicBCeIDInfo />
                  <BusinessBCeIDInfo />
                  <BCSCInfo />
                </Flex>
              </GridItem>

              <GridItem>
                <Flex direction="column" gap={6}>
                  <BusinessBCeIDInfo />
                  <BasicBCeIDInfo />
                </Flex>
              </GridItem>
            </Grid>
          )}
        </Flex>
        {isAdmin ? (
          <Text>{t("auth.adminAccountAccess")}</Text>
        ) : (
          <>
            <Text>
              {t("auth.loginHelp")}
              <Link href="https://www.bceid.ca/clp/account_recovery.aspx" isExternal>
                {t("auth.bceid")}
              </Link>{" "}
              {t("ui.or")}{" "}
              <Link
                href="https://www2.gov.bc.ca/gov/content/governments/government-id/bcservicescardapp#setup"
                isExternal
              >
                {t("auth.bcsc")}
              </Link>
            </Text>

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

const IdirLoginForm: React.FC = () => {
  // @ts-ignore
  const csrfToken = document.querySelector("[name=csrf-token]")?.content
  const { t } = useTranslation()

  return (
    <form action="/api/auth/keycloak" method="post">
      <input type="hidden" name="kc_idp_hint" value={OMNIAUTH_PROVIDERS.idir} />
      <input type="hidden" name="authenticity_token" value={csrfToken} />
      <Button variant="primary" w="full" type="submit">
        {t("auth.idirLogin")}
      </Button>
    </form>
  )
}

const BcscLoginForm: React.FC = () => {
  // @ts-ignore
  const csrfToken = document.querySelector("[name=csrf-token]")?.content
  const { t } = useTranslation()

  return (
    <form action="/api/auth/keycloak" method="post">
      <input type="hidden" name="kc_idp_hint" value={OMNIAUTH_PROVIDERS.bcsc} />
      <input type="hidden" name="authenticity_token" value={csrfToken} />
      <Button variant="primary" w="full" type="submit">
        {t("auth.bcscLogin")}
      </Button>
    </form>
  )
}
const BceidLoginForm: React.FC = () => {
  // @ts-ignore
  const csrfToken = document.querySelector("[name=csrf-token]")?.content
  const { t } = useTranslation()

  return (
    <form action="/api/auth/keycloak" method="post">
      <input type="hidden" name="kc_idp_hint" value={OMNIAUTH_PROVIDERS.bceid} />
      <input type="hidden" name="authenticity_token" value={csrfToken} />
      <Button variant="primary" w="full" type="submit">
        {t("auth.bceidLogin")}
      </Button>
    </form>
  )
}
