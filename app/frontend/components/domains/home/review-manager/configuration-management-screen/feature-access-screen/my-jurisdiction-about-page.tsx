import { Button, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"
import { SwitchButton } from "../../../../../shared/buttons/switch-button"
import { RouterLinkButton } from "../../../../../shared/navigation/router-link-button"

export const myJurisdictionAboutPageScreen = observer(() => {
  const i18nPrefix = "home.configurationManagement.featureAccess"
  const { currentJurisdiction } = useJurisdiction()
  const navigate = useNavigate()
  const { t } = useTranslation()
  console.log(currentJurisdiction?.slug)
  const [isEnabled, setIsEnabled] = useState(currentJurisdiction?.showAboutPage ?? false)

  const handleToggle = (checked) => {
    setIsEnabled(checked)
    currentJurisdiction.update({ showAboutPage: checked })
  }

  return (
    <Container maxW="container.lg" p={8} as={"main"}>
      <VStack alignItems={"flex-start"} w={"full"} h={"full"} gap={6}>
        <Button variant="link" onClick={() => navigate(-1)} leftIcon={<CaretLeft size={20} />} textDecoration="none">
          {t("ui.back")}
        </Button>
        <Flex align="center" w="100%" direction="column" alignItems="flex-start">
          <Heading as="h1" mb={4}>
            {/* ts-ignore */}
            {t(`${i18nPrefix}.myJurisdictionAboutPage`)}
          </Heading>
          <Text color="text.secondary" fontSize="lg" mt={2}>
            <Trans
              i18nKey={`${i18nPrefix}.myJurisdictionAboutPageDescription`}
              components={{
                1: (
                  <RouterLinkButton
                    variant={"link"}
                    to={"/jurisdictions/" + currentJurisdiction?.slug}
                    fontSize="lg"
                    textDecoration="none"
                  ></RouterLinkButton>
                ),
              }}
            ></Trans>
          </Text>
        </Flex>
      </VStack>
      <Flex mt={8} align="center" w="100%" direction="row" justify="space-between">
        <Flex direction="column" alignItems="flex-start">
          <Heading as="h2" fontSize="2xl" fontWeight="bold" mb={4}>
            {t(`${i18nPrefix}.editJurisdictionAboutPage`)}
          </Heading>
        </Flex>
        <SwitchButton isChecked={isEnabled} onChange={(e) => handleToggle(e.target.checked)} size={"lg"} />
      </Flex>
    </Container>
  )
})
