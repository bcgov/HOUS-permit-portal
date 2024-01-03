import "@bcgov/design-tokens/css/variables.css"
import {
  Box,
  BoxProps,
  Center,
  Checkbox,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Image,
  ListItem,
  Select,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react"
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { faChevronRight, faCircleCheck, faClipboardCheck, faFileArrowUp } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import i18next from "i18next"
import React, { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { YellowLineSmall } from "../../shared/base/decorative/yellow-line-small"
import { RouterLink } from "../../shared/navigation/router-link"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"

interface ILandingScreenProps {}

export const LandingScreen = ({}: ILandingScreenProps) => {
  const { t } = useTranslation()

  const whoFor = i18next.t("landing.whoFor", { returnObjects: true }) as string[]

  return (
    <Flex direction="column" w="full" bg="greys.white">
      <Flex
        align="center"
        h="364px"
        bgImage="https://placehold.co/1080x364"
        bgPosition="center"
        bgRepeat="no-repeat"
        bgSize="cover"
      >
        <Container maxW="container.lg" py={16} px={8}>
          <Flex
            direction="column"
            p={8}
            maxW="468px"
            bg="theme.blue"
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
          </Flex>
        </Container>
      </Flex>
      <Container maxW="container.lg" py={16} px={8}>
        <Flex as="section" direction="column" gap={20}>
          <Flex gap={6} direction={{ base: "column", md: "row" }}>
            <IconBox icon={faFileArrowUp}>{t("landing.easilyUpload")}</IconBox>
            <IconBox icon={faCircleCheck}>{t("landing.bestPractices")}</IconBox>
            <IconBox icon={faClipboardCheck}>{t("landing.easyToFollow")}</IconBox>
          </Flex>

          <Flex gap={10} direction={{ base: "column", md: "row" }}>
            <Flex
              as="section"
              direction="column"
              borderRadius="lg"
              // bg="theme.blueAlt"
              p={8}
              gap={6}
              color="greys.white"
              flex={1}
              style={{ backgroundColor: "var(--bcds-surface-primary-invert)" }}
            >
              <Heading fontSize="xl">{t("landing.accessMyPermits")}</Heading>
              <Text>{t("landing.accessExplanation")}</Text>
              <YellowLineSmall />
              <Flex gap={6} direction={{ base: "column", md: "row" }}>
                <RouterLinkButton
                  to="/login"
                  rightIcon={<FontAwesomeIcon style={{ height: 14, width: 14 }} icon={faChevronRight} />}
                >
                  {t("auth.login")}
                </RouterLinkButton>
                <RouterLinkButton
                  to="/register"
                  rightIcon={<FontAwesomeIcon style={{ height: 14, width: 14 }} icon={faChevronRight} />}
                >
                  {t("auth.register")}
                </RouterLinkButton>
              </Flex>
            </Flex>
            <Flex as="section" direction="column" flex={1} gap={4}>
              <Flex direction="column" gap={2}>
                <YellowLineSmall mt={4} />
                <Heading>{t("landing.whoForTitle")}</Heading>
              </Flex>
              <UnorderedList spacing={1} pl={4}>
                {whoFor.map((str) => (
                  <ListItem key={str}>{str}</ListItem>
                ))}
              </UnorderedList>
              <RouterLink to="#">{t("landing.iNeed")}</RouterLink>
            </Flex>
          </Flex>
          <Flex gap={10} direction={{ base: "column-reverse", md: "row" }}>
            <Image src="https://placehold.co/230x150" alt="dont-forget-me" />
            <Flex as="section" direction="column" gap={4}>
              <Heading fontSize="xl">{t("landing.whyUseTitle")}</Heading>
              <Text>{t("landing.whyUse")}</Text>
            </Flex>
          </Flex>
        </Flex>
      </Container>
      <Container maxW="container.lg" px={8}>
        <VStack as="section" w="full" gap={2} mb={4} textAlign="center">
          <Heading fontSize="4xl">{t("landing.iNeedLong")}</Heading>
          <Text>{t("landing.reqsVary")}</Text>
        </VStack>
      </Container>
      <Flex w="full" bg="greys.grey03">
        <Container maxW="container.lg" py={10} px={8}>
          <Flex as="section" direction="column" gap={6}>
            <HousingTypeSearch />
            <VStack w="full" gap={2} textAlign="center" py={4} px={8}>
              <Heading fontSize="md">{t("landing.whenNotNecessaryQ")}</Heading>
              <Text>{t("landing.whenNotNecessaryA")}</Text>
            </VStack>
          </Flex>
        </Container>
      </Flex>
      <Flex w="full" bg="greys.white">
        <Container maxW="container.lg" py={16} px={8}>
          <Flex direction="column" gap={6}>
            <VStack as="section" w="full" gap={2} textAlign="center">
              <Heading fontSize="md">{t("landing.expectQ")}</Heading>
              <Text>{t("landing.expectA")}</Text>
            </VStack>
            <Center w="full" h="217px" bg="greys.grey03">
              suggestion: Lottie?
            </Center>
          </Flex>
        </Container>
      </Flex>

      <Flex w="full" bg="greys.grey03">
        <Container maxW="container.lg" py={10}>
          <VStack as="section" w="full" gap={2} textAlign="center">
            <Heading fontSize="md">{t("landing.createdQ")}</Heading>
            <Text>{t("landing.createdA")}</Text>
          </VStack>
        </Container>
      </Flex>
    </Flex>
  )
}

interface IHousingTypeSearchProps {}
const HousingTypeSearch = ({}: IHousingTypeSearchProps) => {
  const { t } = useTranslation()
  const housingtypes = [
    { imageUrl: "https://placehold.co/152x143", label: "TYPE", url: "#" },
    { imageUrl: "https://placehold.co/152x143", label: "TYPE", url: "#" },
    { imageUrl: "https://placehold.co/152x143", label: "TYPE", url: "#" },
    { imageUrl: "https://placehold.co/152x143", label: "TYPE", url: "#" },
    { imageUrl: "https://placehold.co/152x143", label: "TYPE", url: "#" },
    { imageUrl: "https://placehold.co/152x143", label: "TYPE", url: "#" },
    { imageUrl: "https://placehold.co/152x143", label: "TYPE", url: "#" },
    { imageUrl: "https://placehold.co/152x143", label: "TYPE", url: "#" },
  ]

  return (
    <Flex gap={6} direction={{ base: "column", md: "row" }}>
      <Flex direction="column" bg="white" flex={1} p={6} gap={4}>
        <Flex as="section" direction="column" gap={2}>
          <YellowLineSmall mt={4} />
          <Heading fontSize="2xl">{t("landing.whereTitle")}</Heading>
          <Text>{t("landing.findAuthority")}</Text>
        </Flex>

        <FormControl>
          <FormLabel>{t("landing.locationOr")}</FormLabel>
          {/* TODO: Implement using react-select */}
          <Select placeholder={t("ui.selectPlaceholder")}>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </Select>
        </FormControl>

        <FormControl>
          <Flex direction="column" gap={4}>
            <FormLabel>{t("ui.selectApplicable")}</FormLabel>
            <Checkbox>{t("landing.withinXRiver")}</Checkbox>
            <Checkbox>{t("landing.withinXForest")}</Checkbox>
            <Checkbox>{t("landing.withinXProtected")}</Checkbox>
          </Flex>
        </FormControl>
        <Box bg="greys.grey03" w="full" h="171px"></Box>
      </Flex>

      <Flex direction="column" bg="white" flex={3} p={6} gap={4}>
        <Flex as="section" direction="column" gap={2}>
          <YellowLineSmall mt={4} />
          <Heading fontSize="2xl">{t("landing.whatType")}</Heading>
          <Text>
            {t("landing.dontSee")} <RouterLink to="#">{t("ui.clickHere")}</RouterLink>
          </Text>
        </Flex>
        <Grid
          templateColumns={{ base: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }}
          gap={4}
        >
          {housingtypes.map((type) => (
            <Flex direction="column" key={type.url} textAlign="center" gap={2} p={2}>
              <Image src={type.imageUrl} alt={type.label} objectFit="cover" />
              <RouterLinkButton variant="link" fontWeight="bold" fontSize="sm" color="text.link" to={type.url}>
                {type.label}
              </RouterLinkButton>
            </Flex>
          ))}
        </Grid>
      </Flex>
    </Flex>
  )
}

interface IIconBoxProps extends BoxProps {
  icon: IconProp
  children: ReactNode
}

const IconBox = ({ icon, children, ...rest }: IIconBoxProps) => {
  return (
    <Box p={4} borderRadius="lg" bg="theme.blueLight" color="theme.blueAlt" flex={1} {...rest}>
      <Flex gap={4} align="center" h="full">
        <FontAwesomeIcon style={{ height: "24px", width: "24px" }} icon={icon} />
        <Text fontSize="md" fontWeight="bold">
          {children}
        </Text>
      </Flex>
    </Box>
  )
}
