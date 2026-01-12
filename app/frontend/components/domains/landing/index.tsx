import {
  Box,
  BoxProps,
  Button,
  Container,
  Flex,
  Heading,
  Image,
  Link,
  ListItem,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react"
import { CaretRight, CheckCircle, ClipboardText, FileArrowUp, Info } from "@phosphor-icons/react"
import i18next from "i18next"
import { observer } from "mobx-react-lite"
import React, { ReactNode, useEffect, useRef } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { RouterLink } from "../../shared/navigation/router-link"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { StepCodeLookupTool } from "../project-readiness-tools/step-code-lookup-tool"

interface ILandingScreenProps {}

export const LandingScreen = observer(({}: ILandingScreenProps) => {
  const { t } = useTranslation()
  const mailto = "mailto:" + t("site.contactEmail")
  const iNeedRef = useRef<HTMLDivElement>(null)
  const { userStore } = useMst()
  const { currentUser } = userStore

  const scrollToJurisdictionSearch = () => {
    iNeedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const whoFor = i18next.t("landing.whoFor", { returnObjects: true }) as string[]

  return (
    <Flex direction="column" w="full" bg="greys.white">
      <Flex
        align="center"
        h={{ base: "calc(100vh - 200px)", sm: "364px" }}
        bgImage="/images/header-background.jpeg"
        bgPosition="center 60%"
        bgRepeat="no-repeat"
        bgSize="cover"
        bgColor="theme.blue"
      >
        <Flex direction="column" justify="center" bgColor="theme.blueShadedLight" w="full" height="full">
          <Container maxW="container.lg" px={8}>
            <Flex
              direction="column"
              p={8}
              maxW="468px"
              bg="theme.blueShadedDark"
              color="greys.white"
              borderRadius="sm"
              borderLeft="8px solid"
              borderColor="theme.yellow"
              gap={2}
            >
              <Heading as="h1" fontSize="2xl">
                {t("landing.title")}
              </Heading>
              <Text fontSize="lg">{t("landing.intro")}</Text>
              <RouterLinkButton
                to={currentUser ? "/" : "/login"}
                variant="primaryInverse"
                rightIcon={<CaretRight size={16} />}
              >
                {currentUser
                  ? t("landing.goTo", {
                      location: currentUser?.isSuperAdmin ? t("landing.adminPanel") : t("landing.projectsPanel"),
                    })
                  : t("landing.permitApp")}
              </RouterLinkButton>
            </Flex>
          </Container>
        </Flex>
      </Flex>
      <Box bg="greys.grey03">
        <Flex as="section" direction="column" gap={20}>
          <VStack spacing={4} py={4} px={8} align="start" w="full" maxW="container.lg" mx="auto">
            <Heading as="h1" variant="yellowline">
              {t("home.projectReadinessTools.stepCodeLookupTool.title")}
            </Heading>
            <StepCodeLookupTool showJurisdictionOnPage={true} />
          </VStack>
        </Flex>
      </Box>

      <Container maxW="container.lg" py={16} px={8}>
        <Flex as="section" direction="column" gap={20}>
          <Flex gap={6} direction={{ base: "column", md: "row" }}>
            <IconBox icon={<FileArrowUp size={32} />}>{t("landing.easilyUpload")}</IconBox>
            <IconBox icon={<CheckCircle size={32} />}>{t("landing.bestPractices")}</IconBox>
            <IconBox icon={<ClipboardText size={32} />}>{t("landing.easyToFollow")}</IconBox>
          </Flex>
          <Flex
            as="section"
            direction="column"
            borderRadius="lg"
            bg="var(--chakra-colors-background-blueLight)"
            p={8}
            gap={6}
            color="theme.secondary"
            flex={1}
            minW={{ base: "0", md: "50%" }}
            boxShadow="sm"
            position="relative"
          >
            <Heading as="h2" fontSize="2xl" mb={2} fontWeight="bold">
              {t("landing.toolsSectionTitle")}
            </Heading>
            <Text fontSize="lg">{t("landing.toolsSectionDesc1")}</Text>
            <Button
              as={RouterLink}
              to="/project-readiness-tools"
              variant="primary"
              size="lg"
              alignSelf="flex-start"
              rightIcon={<CaretRight size={20} />}
              mt={2}
            >
              {t("landing.goToTools")}
            </Button>
          </Flex>
          <Flex gap={10} alignItems="flex-start" direction={{ base: "column", md: "row" }}>
            <VStack as="section" align="flex-start" spacing={4}>
              <Heading as="h2" variant="yellowline">
                {t("landing.whoForTitle")}
              </Heading>
              <UnorderedList spacing={1} pl={4}>
                {whoFor.map((str) => (
                  <ListItem key={str}>{str}</ListItem>
                ))}
              </UnorderedList>
              <Button variant="link" onClick={scrollToJurisdictionSearch}>
                {t("landing.iNeed")}
              </Button>
            </VStack>
          </Flex>
          <Flex gap={10} direction={{ base: "column-reverse", md: "row" }}>
            <Image src="/images/digital-permit-tools.png" borderRadius="md" w="2xs" alt="Digital permit tools" />
            <Flex as="section" direction="column" gap={4}>
              <Heading as="h3">{t("landing.whyUseTitle")}</Heading>
              <Text>{t("landing.whyUse")}</Text>
            </Flex>
          </Flex>
        </Flex>
      </Container>
      <Container maxW="container.lg" px={8} ref={iNeedRef}>
        <VStack as="section" w="full" gap={2} mb={4} textAlign="center">
          <Heading as="h3" fontSize="4xl">
            {t("landing.iNeedLong")}
          </Heading>
          <Text>{t("landing.permitImportance")}</Text>
        </VStack>
      </Container>
      <Box bg="greys.grey03">
        <Container maxW="container.lg" py={10} px={8}>
          <VStack as="section" direction="column" gap={6}>
            <AvailableJurisdictionsMessageBox />
            <Heading as="h3" fontSize="md" mt="8">
              {t("landing.whenNotNecessaryQ")}
            </Heading>
            <Text>{t("landing.whenNotNecessaryA")}</Text>

            <Text>
              <Trans
                i18nKey="landing.permitConnect"
                components={{
                  1: <Link href={"https://permitconnectbc.gov.bc.ca/"}></Link>,
                }}
              />
            </Text>
          </VStack>
        </Container>
      </Box>
      <Box bg="greys.white">
        <Container maxW="container.lg" py={16} px={8} textAlign="center" gap="6">
          <Heading as="h3" fontSize="md" textAlign="left">
            {t("landing.expectQ")}
          </Heading>
          <Text textAlign="left">{t("landing.expectA")}</Text>

          <Flex mt={8} gap={6} direction={{ base: "column", md: "row" }}>
            <BareBox>
              <Text>{t("landing.card1Title")}</Text>
              <br />
              <Text as="span" fontWeight={400}>
                {t("landing.card1Body")}
              </Text>
            </BareBox>

            <BareBox>
              <Text>{t("landing.card2Title")}</Text>
              <br />
              <Text as="span" fontWeight={400}>
                {t("landing.card2Body")}
              </Text>
            </BareBox>

            <BareBox>
              <Text>{t("landing.card3Title")}</Text>
              <br />
              <Text as="span" fontWeight={400}>
                {t("landing.card3Body")}
              </Text>
            </BareBox>
          </Flex>
          <Box mt={16} p={8} bg="theme.blueLight" borderRadius="lg" w="full" textAlign="left">
            <Heading as="h2" size="lg" mb={4}>
              {t("landing.helpShapeTitle")}
            </Heading>
            <Text mb={4}>{t("landing.helpShapeBody")}</Text>
            <Flex justifyContent="space-between" alignItems="center">
              <Button
                as={RouterLink}
                to="/standardization-preview"
                rightIcon={<CaretRight size={20} />}
                variant="primary"
              >
                {t("landing.reviewMaterials")}
              </Button>
            </Flex>
          </Box>
        </Container>
      </Box>
      <Box bg="greys.grey03">
        <Container maxW="container.lg" py={10} gap="2" textAlign="center">
          <Heading as="h3" fontSize="md">
            {t("landing.createdQ")}
          </Heading>
          <Text>{t("landing.createdA")}</Text>
          <Link href={mailto} isExternal mt="4">
            {t("landing.tellUsYourExperience")}
          </Link>
        </Container>
      </Box>
    </Flex>
  )
})

interface IIconBoxProps extends BoxProps {
  icon: ReactNode
  children: ReactNode
}

const IconBox = ({ icon, children, ...rest }: IIconBoxProps) => {
  return (
    <Box p={4} borderRadius="lg" bg="theme.blueLight" color="theme.blueAlt" flex={1} {...rest}>
      <Flex gap={4} align="center" h="full">
        <Box>{icon}</Box>
        <Text fontSize="md" fontWeight="bold">
          {children}
        </Text>
      </Flex>
    </Box>
  )
}

interface IBareBoxProps {
  children: ReactNode
}

const BareBox: React.FC<IBareBoxProps> = ({ children }) => {
  return (
    <Box p={4} borderRadius="lg" bg="theme.blueLight" color="theme.blueAlt" flex={1}>
      <Flex gap={6} align="center" h="full">
        <Text as="div" fontSize="md" fontWeight="bold" textAlign="left">
          {children}
        </Text>
      </Flex>
    </Box>
  )
}

const AvailableJurisdictionsMessageBox: React.FC = observer(() => {
  const { t } = useTranslation()
  const { jurisdictionStore } = useMst()

  const { tableJurisdictions, searchEnabledJurisdictions, totalPages } = jurisdictionStore

  useEffect(() => {
    searchEnabledJurisdictions(12)
  }, [])

  return (
    <Flex
      direction="column"
      gap={2}
      bg={"semantic.infoLight"}
      border="1px solid"
      borderRadius="lg"
      borderColor={"semantic.info"}
      p={4}
    >
      <Flex align="flex-start" gap={2}>
        <Box color={"semantic.info"}>
          <Info size={24} />
        </Box>
        <Flex direction="column" gap={2}>
          <Text fontWeight="bold">
            {t("landing.enabledCommunitiesDescription")}{" "}
            {tableJurisdictions.map((jurisdiction) => (
              <Text as="span" fontWeight="normal" key={jurisdiction.id} mr={2}>
                <RouterLink color="black" to={`/jurisdictions/${jurisdiction.slug}`}>
                  {jurisdiction.qualifiedName}
                </RouterLink>
              </Text>
            ))}
            <br />
            {totalPages > 1 ? (
              <Text as="span" fontWeight="bold">
                {t("landing.andMore")}
              </Text>
            ) : (
              <Text as="span" fontWeight="normal">
                {t("landing.moreComingSoon")}
              </Text>
            )}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  )
})
