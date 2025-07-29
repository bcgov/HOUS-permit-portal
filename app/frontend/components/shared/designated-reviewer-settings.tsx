import { Button, Container, Flex, Heading, ListItem, Text, UnorderedList, VStack } from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Trans, useTranslation } from "react-i18next"
import { useMst } from "../../setup/root"
import { SwitchButton } from "./buttons/switch-button"

interface IDesignatedReviewerSettingsProps {
  handleBack: () => void
  title: string
  isEnabled: boolean
  onToggle: (checked: boolean) => void
}

export const DesignatedReviewerSettings = observer(
  ({ handleBack, title, isEnabled, onToggle }: IDesignatedReviewerSettingsProps) => {
    const { t } = useTranslation()
    const { userStore } = useMst()
    const { currentUser } = userStore

    const i18nPrefix = currentUser?.isSuperAdmin
      ? "siteConfiguration.globalFeatureAccess.editDesignatedReviewer"
      : "home.configurationManagement.featureAccess.editDesignatedReviewer"

    return (
      <Container maxW="container.lg" p={8} as={"main"}>
        <VStack alignItems={"flex-start"} w={"full"} h={"full"} gap={6}>
          <Button variant="link" onClick={handleBack} leftIcon={<CaretLeft size={20} />} textDecoration="none">
            {t("ui.back")}
          </Button>
          <Heading as="h1" m={0} p={0}>
            {title}
          </Heading>
          <Flex justify="space-between" w="100%">
            <VStack alignItems="flex-start">
              <Text>{t(`${i18nPrefix}.intro`)}</Text>
              <UnorderedList pl={6} spacing={2}>
                <ListItem>
                  <Trans i18nKey={`${i18nPrefix}.item1`} />
                </ListItem>
                <ListItem>
                  <Trans i18nKey={`${i18nPrefix}.item2`} />
                </ListItem>
              </UnorderedList>
            </VStack>
          </Flex>
        </VStack>
        <Flex mt={8} align="center" w="100%" direction="row" justify="space-between">
          <Flex direction="column" alignItems="flex-start">
            <Heading as="h2" fontSize="2xl" fontWeight="bold" mb={4}>
              {title}
            </Heading>
          </Flex>
          <SwitchButton isChecked={isEnabled} onChange={(e) => onToggle(e.target.checked)} size={"lg"} />
        </Flex>
      </Container>
    )
  }
)
