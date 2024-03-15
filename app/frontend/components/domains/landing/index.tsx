import { Box, BoxProps, Container, Flex, Heading, Image, ListItem, Text, UnorderedList, VStack } from "@chakra-ui/react"
import { CaretRight, CheckCircle, ClipboardText, FileArrowUp } from "@phosphor-icons/react"
import i18next from "i18next"
import React, { ReactNode, useEffect, useState } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IJurisdiction } from "../../../models/jurisdiction"
import { useMst } from "../../../setup/root"
import { YellowLineSmall } from "../../shared/base/decorative/yellow-line-small"
import { RouterLink } from "../../shared/navigation/router-link"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { AddressSelect } from "../../shared/select/selectors/address-select"

interface ILandingScreenProps {}

export const LandingScreen = ({}: ILandingScreenProps) => {
  const { t } = useTranslation()

  const whoFor = i18next.t("landing.whoFor", { returnObjects: true }) as string[]

  return (
    <Flex direction="column" w="full" bg="greys.white">
      <Flex
        align="center"
        h="364px"
        bgImage="images/header-background.jpeg"
        bgPosition="center 60%"
        bgRepeat="no-repeat"
        bgSize="cover"
        bgColor="theme.blue"
      >
        <Box bgColor="theme.blueShadedLight" w="full" height="full">
          <Container maxW="container.lg" py={16} px={8}>
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
            </Flex>
          </Container>
        </Box>
      </Flex>
      <Container maxW="container.lg" py={16} px={8}>
        <Flex as="section" direction="column" gap={20}>
          <Flex gap={6} direction={{ base: "column", md: "row" }}>
            <IconBox icon={<FileArrowUp size={24} />}>{t("landing.easilyUpload")}</IconBox>
            <IconBox icon={<CheckCircle size={24} />}>{t("landing.bestPractices")}</IconBox>
            <IconBox icon={<ClipboardText size={24} />}>{t("landing.easyToFollow")}</IconBox>
          </Flex>

          <Flex gap={10} direction={{ base: "column", md: "row" }}>
            <Flex
              as="section"
              direction="column"
              borderRadius="lg"
              bg="theme.blueAlt"
              p={8}
              gap={6}
              color="greys.white"
              flex={1}
            >
              <Heading as="h2">{t("landing.accessMyPermits")}</Heading>
              <Text>{t("landing.accessExplanation")}</Text>
              <YellowLineSmall />
              <Flex gap={6} direction={{ base: "column", md: "row" }}>
                <RouterLinkButton to="/login" variant="primaryInverse" rightIcon={<CaretRight size={16} />}>
                  {t("auth.login")}
                </RouterLinkButton>
                <RouterLinkButton to="/register" variant="primaryInverse" rightIcon={<CaretRight size={16} />}>
                  {t("auth.register")}
                </RouterLinkButton>
              </Flex>
            </Flex>
            <VStack as="section" align="flex-start" spacing={4}>
              <Heading as="h2" variant="yellowline">
                {t("landing.whoForTitle")}
              </Heading>

              <UnorderedList spacing={1} pl={4}>
                {whoFor.map((str) => (
                  <ListItem key={str}>{str}</ListItem>
                ))}
              </UnorderedList>
              <RouterLink to="#">{t("landing.iNeed")}</RouterLink>
            </VStack>
          </Flex>
          <Flex gap={10} direction={{ base: "column-reverse", md: "row" }}>
            <Image src="https://placehold.co/230x150" alt="dont-forget-me" />
            <Flex as="section" direction="column" gap={4}>
              <Heading as="h3">{t("landing.whyUseTitle")}</Heading>
              <Text>{t("landing.whyUse")}</Text>
            </Flex>
          </Flex>
        </Flex>
      </Container>
      <Container maxW="container.lg" px={8}>
        <VStack as="section" w="full" gap={2} mb={4} textAlign="center">
          <Heading as="h3" fontSize="4xl">
            {t("landing.iNeedLong")}
          </Heading>
          <Text>{t("landing.reqsVary")}</Text>
        </VStack>
      </Container>
      <Flex w="full" bg="greys.grey03">
        <Container maxW="container.lg" py={10} px={8}>
          <Flex as="section" direction="column" gap={6}>
            <JurisdictionSearch />
            <VStack w="full" gap={2} textAlign="center" py={4} px={8}>
              <Heading as="h3" fontSize="md">
                {t("landing.whenNotNecessaryQ")}
              </Heading>
              <Text>{t("landing.whenNotNecessaryA")}</Text>
            </VStack>
          </Flex>
        </Container>
      </Flex>
      <Flex w="full" bg="greys.white">
        <Container maxW="container.lg" py={16} px={8}>
          <Flex direction="column" gap={6}>
            <VStack as="section" w="full" gap={2} textAlign="center">
              <Heading as="h3" fontSize="md">
                {t("landing.expectQ")}
              </Heading>
              <Text>{t("landing.expectA")}</Text>
            </VStack>
          </Flex>
        </Container>
      </Flex>

      <Flex w="full" bg="greys.grey03">
        <Container maxW="container.lg" py={10}>
          <VStack as="section" w="full" gap={2} textAlign="center">
            <Heading as="h3" fontSize="md">
              {t("landing.createdQ")}
            </Heading>
            <Text>{t("landing.createdA")}</Text>
          </VStack>
        </Container>
      </Flex>
    </Flex>
  )
}

interface IJurisdictionSearchProps {}
const JurisdictionSearch = ({}: IJurisdictionSearchProps) => {
  const { t } = useTranslation()
  const { geocoderStore } = useMst()
  const { fetchGeocodedJurisdiction } = geocoderStore
  const formMethods = useForm()
  const { control, watch } = formMethods
  const [jurisdiction, setJurisdiction] = useState<IJurisdiction>(null)

  const addressWatch = watch("address")

  useEffect(() => {
    if (!addressWatch?.value) return
    ;(async () => {
      const jurisdiction = await fetchGeocodedJurisdiction(addressWatch.value)
      setJurisdiction(jurisdiction)
    })()
  }, [addressWatch?.value])

  return (
    <Flex gap={6} direction={{ base: "column", md: "row" }}>
      <Flex bg="white" flex={3} p={6} gap={4}>
        <FormProvider {...formMethods}>
          <form>
            <Controller
              name="address"
              control={control}
              render={({ field: { onChange, value } }) => {
                return <AddressSelect onChange={onChange} value={value} />
              }}
            />
          </form>
        </FormProvider>
        {addressWatch?.value}
        <br />
        {jurisdiction?.name}
      </Flex>
    </Flex>
  )
}

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
