import { Flex, HStack, Text } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"

interface IStepCodeSubNavBarProps {
  infoPagePath: string
  isPermitLinked: boolean
  exitLinkPath: string
}

export function StepCodeSubNavBar({ infoPagePath, isPermitLinked, exitLinkPath }: IStepCodeSubNavBarProps) {
  const { t } = useTranslation()

  return (
    <Flex
      as="nav"
      w="full"
      flexShrink={0}
      align="center"
      justify="space-between"
      gap={4}
      wrap="wrap"
      bg="greys.white"
      px={{ base: 4, md: 8 }}
      py={3}
      shadow="elevations.elevation01"
      zIndex={9}
    >
      <Text fontWeight="bold" mb={0}>
        {t("stepCode.subNav.title")}
      </Text>
      <HStack spacing={3} ml="auto">
        <RouterLinkButton to={infoPagePath} variant="secondary">
          {t("stepCode.subNav.projectInfo")}
        </RouterLinkButton>
        <RouterLinkButton to={exitLinkPath} variant="primary">
          {t(isPermitLinked ? "stepCode.goToPermitApplication" : "stepCode.goToStepCodes")}
        </RouterLinkButton>
      </HStack>
    </Flex>
  )
}
