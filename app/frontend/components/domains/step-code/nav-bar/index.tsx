import { Box, Flex, Image, Link, Spacer, Text } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"

interface IProps {
  title: string
  NavLinks?: JSX.Element
}

export const StepCodeNavBar = observer(function StepCodeNavBar({ title, NavLinks }: IProps) {
  return (
    <Flex
      as="nav"
      id="stepCodeNav"
      position="sticky"
      top={0}
      w="full"
      h="var(--app-navbar-height)"
      bg="white"
      color="theme.blue"
      zIndex={10}
      borderBottom="1px"
      borderColor="border.light"
      align="center"
      px={6}
      gap={6}
    >
      <Link href="/">
        <Box w={120} mr={2}>
          <Image
            objectFit="contain"
            htmlHeight="64px"
            htmlWidth="166px"
            alt={t("site.linkHome")}
            src="/images/logo.svg"
          />
        </Box>
      </Link>
      <Box hideBelow="xl">
        <Text fontSize="md" color="text.primary" fontWeight="bold">
          {title}
        </Text>
        <Text fontSize="sm" textTransform="uppercase" color="theme.yellow" fontWeight="bold" mb={2} ml={1}>
          {t("site.beta")}
        </Text>
      </Box>
      <Spacer />
      {NavLinks || null}
    </Flex>
  )
})
