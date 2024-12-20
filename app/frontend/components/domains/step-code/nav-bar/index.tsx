import { Box, Flex, Image, Show, Spacer, Text } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"

interface IProps {
  title: string
  NavLinks?: JSX.Element
}

export const StepCodeNavBar = observer(function StepCodeNavBar({ title, NavLinks }: IProps) {
  return (
    <Box
      as="nav"
      id="stepCodeNav"
      position="sticky"
      py={4}
      top={0}
      left="0"
      right="0"
      w="full"
      bg="greys.white"
      color="theme.blue"
      zIndex={10}
      borderBottomWidth={2}
      borderColor="border.light"
      shadow="elevations.elevation01"
    >
      <Flex align="center" gap={2} px={8}>
        <Image fit="cover" htmlHeight="64px" htmlWidth="166px" alt={t("site.linkHome")} src="/images/logo.svg" />
        <Show above="xl">
          <Text fontSize="md" color="text.primary" fontWeight="bold">
            {title}
          </Text>
          <Text fontSize="sm" textTransform="uppercase" color="theme.yellow" fontWeight="bold" mb={2} ml={1}>
            {t("site.beta")}
          </Text>
        </Show>
        <Spacer />
        {NavLinks || null}
      </Flex>
    </Box>
  )
})
