import { Button, Container, Flex, Heading, Link, ListItem, Text, UnorderedList } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Trans, useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../setup/root"

export const OverheatingToolScreen = observer(() => {
  const navigate = useNavigate()
  const { t } = useTranslation() as any
  const { sessionStore } = useMst()
  const { loggedIn } = sessionStore

  return (
    <Container maxW="container.lg" pb="36" px="8">
      <Heading as="h1" mt="16" mb="6">
        {t("singleZoneCoolingHeatingTool.title")}
      </Heading>
      <Text fontSize="lg" color="text.primary" mb="4">
        {t("singleZoneCoolingHeatingTool.description")}
      </Text>
      <Text fontSize="lg" color="text.primary" mb="4" mt={8}>
        {t("singleZoneCoolingHeatingTool.serviceDescription")}
      </Text>
      <Flex align="flex-start" bg={"semantic.infoLight"} borderRadius="lg" p={6} mt={6} mb={6}>
        <Flex direction="column" gap={3}>
          <Heading as="h2" fontSize="2xl" color="semantic.info">
            {t("singleZoneCoolingHeatingTool.beforeYouStart")}
          </Heading>
          <Text fontSize="lg" color="semantic.info">
            {t("singleZoneCoolingHeatingTool.beforeYouStartDescription")}{" "}
            <Link href="https://hvacdc.ca/software/" target="_blank" color="blue.600" textDecoration="underline">
              {t("singleZoneCoolingHeatingTool.beforeYouStartDescriptionLink")}
            </Link>
          </Text>
          <UnorderedList pl={6} spacing={1} fontSize="lg" color="semantic.info">
            <ListItem>{t("singleZoneCoolingHeatingTool.beforeYouStartDescriptionList1")}</ListItem>
            <ListItem>{t("singleZoneCoolingHeatingTool.beforeYouStartDescriptionList2")}</ListItem>
          </UnorderedList>
        </Flex>
      </Flex>

      <Button
        size="lg"
        variant="primary"
        mb={10}
        fontWeight="bold"
        onClick={() => {
          navigate("/overheating-tool/start?new=true")
        }}
      >
        {loggedIn ? t(`singleZoneCoolingHeatingTool.start`) : t(`singleZoneCoolingHeatingTool.loginToStart`)}
      </Button>

      <Heading as="h2" fontSize="2xl" mb={3}>
        {t("singleZoneCoolingHeatingTool.whoThisServiceIsFor")}
      </Heading>
      <Text fontSize="lg" color="text.primary" mb={3}>
        {t("singleZoneCoolingHeatingTool.whoThisServiceIsForDescription")}
      </Text>
      <UnorderedList pl={6} spacing={1} fontSize="lg" color="text.primary" mb={8}>
        <ListItem>{t("singleZoneCoolingHeatingTool.whoThisServiceIsForList1")}</ListItem>
        <ListItem>{t("singleZoneCoolingHeatingTool.whoThisServiceIsForList2")}</ListItem>
      </UnorderedList>

      <Heading as="h2" fontSize="2xl" mb={3}>
        {t("singleZoneCoolingHeatingTool.whenToCreateAnOverheatingProtectionComplianceReport")}
      </Heading>
      <Text fontSize="lg" color="text.primary" mb={6}>
        {t("singleZoneCoolingHeatingTool.whenToCreateAnOverheatingProtectionComplianceReportDescription")}
      </Text>

      <Heading as="h2" fontSize="2xl" mb={3}>
        {t("singleZoneCoolingHeatingTool.whatToExpect")}
      </Heading>
      <Text fontSize="lg" color="text.primary" mb={6}>
        {t("singleZoneCoolingHeatingTool.whatToExpectDescription")}
      </Text>

      <Heading as="h2" fontSize="2xl" mb={3}>
        {t("singleZoneCoolingHeatingTool.whatsIncludedInAnOverheatingProtectionComplianceReport")}
      </Heading>
      <UnorderedList pl={6} spacing={1} fontSize="lg" color="text.primary" mb={8}>
        <ListItem>
          {t("singleZoneCoolingHeatingTool.whatsIncludedInAnOverheatingProtectionComplianceReportList1")}
        </ListItem>
        <ListItem>
          {t("singleZoneCoolingHeatingTool.whatsIncludedInAnOverheatingProtectionComplianceReportList2")}
        </ListItem>
      </UnorderedList>

      <Heading as="h2" fontSize="2xl" mb={3}>
        {t("singleZoneCoolingHeatingTool.learnMoreAboutOverheatingProtectionProvisions")}
      </Heading>
      <Text fontSize="lg" color="text.primary" mb={4}>
        {t("singleZoneCoolingHeatingTool.learnMoreAboutOverheatingProtectionProvisionsDescription")}
      </Text>
      <Text fontSize="lg" color="text.primary" mb={6}>
        <Trans
          i18nKey={"singleZoneCoolingHeatingTool.learnMoreAboutOverheatingProtectionProvisionsDescription2"}
          components={{
            1: (
              <Link
                href="https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/construction-industry/building-codes-and-standards/bulletins/2024-code/b24-08_overheating.pdf"
                color="text.link"
                isExternal
              />
            ),
          }}
        />
      </Text>
    </Container>
  )
})
