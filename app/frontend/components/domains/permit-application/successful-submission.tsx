import { Container, Divider, Flex, Heading, Icon, Image, Tag, Text, VStack } from "@chakra-ui/react"
import { CheckCircle } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { usePermitApplication } from "../../../hooks/resources/use-permit-application"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { ContactCard } from "../../shared/jurisdiction/contact-card"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import SandboxHeader from "../../shared/sandbox/sandbox-header"

export const SuccessfulSubmissionScreen = observer(() => {
  const { t } = useTranslation()
  const { currentPermitApplication, error } = usePermitApplication()

  if (error) return <ErrorScreen error={error} />
  if (!currentPermitApplication?.isFullyLoaded) return <LoadingScreen />

  const { jurisdiction, number } = currentPermitApplication
  const { qualifiedName, primaryContact } = jurisdiction
  return (
    <Container maxW="container.lg">
      <Flex direction="column" align="center" my={24} gap={8}>
        <Icon as={CheckCircle} boxSize="14" color="semantic.success" />

        <VStack>
          <Heading as="h1">{t("permitApplication.new.submitted")}</Heading>
          <Text>{t("permitApplication.new.emailed", { jurisdictionName: qualifiedName })}</Text>
          <Tag mt="4" color="semantic.info" border="1px solid" borderColor="semantic.info" p={2}>
            {t("permitApplication.new.yourReference", { number })}
          </Tag>
        </VStack>
        <Flex direction="column" bg="greys.grey04" w="full" p={8} gap={8} borderRadius="md" position="relative">
          {currentPermitApplication.sandbox && (
            <SandboxHeader borderTopRadius={0} override sandbox={currentPermitApplication.sandbox} />
          )}
          <Heading variant="yellowline">{t("permitApplication.new.whatsNextTitle")}</Heading>
          <Text fontSize="lg">{t("permitApplication.new.whatsNext")}</Text>
          <Image
            src="/images/timeline/timeline-graphic-4.png"
            alt="graphic for timeline"
            w="950px"
            h="425px"
            bg="semantic.infoLight"
            objectFit="cover"
          />
          <Divider borderColor="greys.grey02" />
          <Flex direction="column" gap={4}>
            <Text>
              <Text as="span" fontWeight="700">
                {t("permitApplication.new.hearBack")}
              </Text>{" "}
              {t("permitApplication.new.contactInstruction", { jurisdictionName: qualifiedName })}
            </Text>
            {primaryContact && <ContactCard w="fit-content" contact={primaryContact} />}
          </Flex>
        </Flex>

        <RouterLinkButton to={`/`} variant="primary">
          {t("ui.returnHome")}
        </RouterLinkButton>
      </Flex>
    </Container>
  )
})
