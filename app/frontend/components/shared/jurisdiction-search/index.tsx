import { Box, Center, Flex, FormControl, FormLabel, Heading, HStack, InputGroup, Text, VStack } from "@chakra-ui/react"
import { CaretRight, CheckCircle, MapPin } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect, useState } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IJurisdiction } from "../../../models/jurisdiction"
import { useMst } from "../../../setup/root"
import { SharedSpinner } from "../base/shared-spinner"
import { RouterLinkButton } from "../navigation/router-link-button"
import { AddressSelect } from "../select/selectors/address-select"
import { JurisdictionSelect } from "../select/selectors/jurisdiction-select"

interface IJurisdictionSearchProps {}

export const JurisdictionSearch = observer(({}: IJurisdictionSearchProps) => {
  const { t } = useTranslation()
  const { geocoderStore, jurisdictionStore } = useMst()
  const { fetchGeocodedJurisdiction, fetchingJurisdiction } = geocoderStore
  const { addJurisdiction } = jurisdictionStore
  const formMethods = useForm()
  const { control, watch, setValue } = formMethods
  const [jurisdiction, setJurisdiction] = useState<IJurisdiction>(null)
  const [manualMode, setManualMode] = useState<boolean>(false)

  const siteWatch = watch("site")

  useEffect(() => {
    // siteWatch.value may contain an empty string
    // If this is the case, let through this conditional
    // in order to let jurisdiction search fail and set manual mode
    // empty string does not count as isNil but undefined does
    if (R.isNil(siteWatch?.value)) return
    ;(async () => {
      const jurisdiction = await fetchGeocodedJurisdiction(siteWatch.value)
      if (jurisdiction) {
        setJurisdiction(jurisdiction)
      } else {
        setManualMode(true)
      }
    })()
  }, [siteWatch?.value])

  return (
    <Flex gap={6} direction={{ base: "column", md: "row" }} w="full">
      <Flex bg="white" p={6} gap={4} borderRadius="md" w="full">
        <FormProvider {...formMethods}>
          <form style={{ width: "100%" }}>
            <Flex direction="column" gap={6}>
              <Flex direction="column">
                <Heading as="h2" variant="yellowline" mb={2}>
                  {t("landing.where")}
                </Heading>
                <Text>{t("landing.findYourAuth")}</Text>
              </Flex>

              <Controller
                name="site"
                control={control}
                render={({ field: { onChange, value } }) => {
                  return <AddressSelect onChange={onChange} value={value} />
                }}
              />

              {manualMode && (
                <FormControl w="full" zIndex={1}>
                  <FormLabel>{t("jurisdiction.index.title")}</FormLabel>
                  <InputGroup w="full">
                    <JurisdictionSelect
                      onChange={(value) => {
                        if (value) addJurisdiction(value)
                        setJurisdiction(value)
                      }}
                      onFetch={() => setValue("jurisdiction", null)}
                      selectedOption={{ label: jurisdiction?.reverseQualifiedName, value: jurisdiction }}
                      menuPortalTarget={document.body}
                    />
                  </InputGroup>
                </FormControl>
              )}
            </Flex>
          </form>
        </FormProvider>
      </Flex>
      <Center
        bg={jurisdiction ? "theme.blueAlt" : "greys.white"}
        minH={243}
        w="full"
        gap={4}
        borderRadius="md"
        color={jurisdiction ? "greys.white" : "theme.secondary"}
        _hover={{
          background: jurisdiction ? "theme.blue" : null,
          transition: "background 100ms ease-in",
        }}
      >
        {jurisdiction ? (
          <VStack
            gap={8}
            className="jumbo-buttons"
            w="full"
            height="full"
            p={6}
            alignItems="center"
            justifyContent="center"
          >
            <Text textTransform={"uppercase"} fontWeight="light" fontSize="sm">
              {jurisdiction.qualifier}
            </Text>
            <HStack gap={2}>
              <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                {jurisdiction?.name}
              </Text>
              {jurisdiction.inbox_enabled && (
                <Box color="theme.yellow">
                  <CheckCircle size={32} />
                </Box>
              )}
            </HStack>
            <RouterLinkButton
              variant="ghost"
              color="greys.white"
              to={`/jurisdictions/${jurisdiction.slug}`}
              icon={<CaretRight size={16} />}
              textDecoration={"underline"}
              _hover={{
                background: "none",
              }}
            >
              {t("landing.learnRequirements")}
            </RouterLinkButton>
          </VStack>
        ) : (
          <VStack gap={6} p={6}>
            <Center h={50}>{fetchingJurisdiction ? <SharedSpinner /> : <MapPin size={40} />}</Center>
            <Text fontStyle="italic" textAlign="center">
              {t("landing.reqsVary")}
            </Text>
          </VStack>
        )}
      </Center>
    </Flex>
  )
})
