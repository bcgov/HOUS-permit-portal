import { Button, Divider, Flex, Heading, Link, ListItem, Text, UnorderedList, VStack } from "@chakra-ui/react"
import { ArrowSquareOut, CaretRight } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { CenterContainer } from "../../shared/containers/center-container"
import { HelpDrawer } from "../../shared/help-drawer"

interface ILoginScreenProps {}

export const LoginScreen = ({}: ILoginScreenProps) => {
  const { t } = useTranslation()

  return (
    <CenterContainer>
      <Flex
        direction="column"
        maxW="500px"
        gap={6}
        w="full"
        p={10}
        border="solid 1px"
        borderColor="border.light"
        bg="greys.white"
      >
        <VStack spacing={2} align="start">
          <Heading as="h1" mb={0}>
            {t("auth.login")}
          </Heading>
          <Text fontSize="md">{t("auth.prompt")}</Text>
        </VStack>
        <form action="/api/auth/keycloak" method="post">
          {/* @ts-ignore */}
          <input type="hidden" name="kc_idp_hint" value="bceidboth" />
          <input type="hidden" name="authenticity_token" value={document.querySelector("[name=csrf-token]").content} />
          <Button variant="primary" w="full" type="submit">
            {t("auth.bceid_login")}
          </Button>
        </form>
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

        <Flex direction="column" gap={2} p={6} rounded="sm" borderWidth={1} borderColor="border.light">
          <Heading as="h3" m={0}>
            {t("auth.bceidInfo.basic.title")}
          </Heading>
          <Text fontSize="sm">{t("auth.bceidInfo.basic.description")}</Text>
          <UnorderedList fontSize="sm" pl={2}>
            <ListItem>{t("auth.bceidInfo.basic.homeownerAgent")}</ListItem>
            <ListItem>{t("auth.bceidInfo.basic.architectContractor")}</ListItem>
          </UnorderedList>
          <Button
            as={Link}
            href={import.meta.env.VITE_BASIC_BCEID_REGISTRATION_URL}
            isExternal
            variant="secondary"
            rightIcon={<ArrowSquareOut />}
            mt={2}
          >
            {t("auth.bceidInfo.basic.register")}
          </Button>
        </Flex>

        <Flex direction="column" gap={2} p={6} rounded="sm" borderWidth={1} borderColor="border.light">
          <Heading as="h3" m={0}>
            {t("auth.bceidInfo.business.title")}
          </Heading>
          <Text fontSize="sm">{t("auth.bceidInfo.business.description")}</Text>
          <UnorderedList fontSize="sm" pl={2}>
            <ListItem>{t("auth.bceidInfo.business.localGov")}</ListItem>
            <ListItem>{t("auth.bceidInfo.business.company")}</ListItem>
            <ListItem>{t("auth.bceidInfo.business.nonProfit")}</ListItem>
            <ListItem>{t("auth.bceidInfo.business.education")}</ListItem>
          </UnorderedList>
          {/* TODO: link to CMS Page */}
          <Button variant="link" as={Link} href="" rightIcon={<CaretRight />}>
            {t("auth.bceidInfo.business.seeMore")}
          </Button>
          <Button
            as={Link}
            href={import.meta.env.VITE_BUSINESS_BCEID_REGISTRATION_URL}
            isExternal
            variant="secondary"
            rightIcon={<ArrowSquareOut />}
            mt={2}
          >
            {t("auth.bceidInfo.business.register")}
          </Button>
        </Flex>
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
