import { Container, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { SwitchButton } from "../buttons/switch-button"
import { RouterLinkButton } from "../navigation/router-link-button"

interface FeatureToggleScreenProps {
  i18nPrefix: string
  featureKey: string
  backUrl: string
  isEnabled: boolean
  onToggle: (checked: boolean) => void
}

export const FeatureToggleScreen: React.FC<FeatureToggleScreenProps> = ({
  i18nPrefix,
  featureKey,
  backUrl,
  isEnabled,
  onToggle,
}) => {
  const { t } = useTranslation()

  return (
    <Container maxW="container.lg" p={8} as={"main"}>
      <VStack alignItems={"flex-start"} w={"full"} h={"full"} gap={6}>
        <RouterLinkButton variant={"link"} to={backUrl} leftIcon={<CaretLeft size={20} />} textDecoration="none">
          {t("ui.back")}
        </RouterLinkButton>
        <Heading as="h1" m={0}>
          {/* ts-ignore */}
          {t(`${i18nPrefix}.${featureKey}`)}
        </Heading>
        <Text color="text.secondary" m={0}>
          {/* ts-ignore */}
          {t(`${i18nPrefix}.${featureKey}Description`)}
        </Text>
        {/* ts-ignore */}
        <Flex pb={4} justify="space-between" w="100%" borderBottom="1px solid" borderColor="border.light">
          <Text fontWeight="bold">{t(`${i18nPrefix}.${featureKey}`)}</Text>
          <SwitchButton isChecked={isEnabled} onChange={(e) => onToggle(e.target.checked)} size={"lg"} />
        </Flex>
      </VStack>
    </Container>
  )
}
