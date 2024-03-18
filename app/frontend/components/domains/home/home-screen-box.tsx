import { Box, Flex, Heading, Text } from "@chakra-ui/react"
import { CaretRight } from "@phosphor-icons/react"
import React, { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"

interface IHomeScreenBoxProps {
  icon: ReactNode
  href: string
  title: string
  description: string
  useViewText?: boolean
}

export const HomeScreenBox = ({ icon, title, description, href, useViewText }: IHomeScreenBoxProps) => {
  const { t } = useTranslation()

  return (
    <Box
      as="section"
      borderRadius="lg"
      border="1px solid"
      borderColor="border.light"
      p={6}
      w="full"
      className="jumbo-buttons"
      position="relative"
      transition="border-color 200ms ease-out"
      _hover={{
        borderColor: "theme.blueAlt",
        bg: "theme.BlueLight",
      }}
    >
      <Flex direction={{ base: "column", md: "row" }} gap={8} align="center">
        <Flex direction="column" gap={3} flex={1}>
          <Flex color="text.link">
            {icon}
            <Heading as="h3" ml={2}>
              {title}
            </Heading>
          </Flex>
          <Text ml={8}>{description}</Text>
        </Flex>
        <RouterLinkButton to={href} variant="tertiary" rightIcon={<CaretRight size={16} />} position="static">
          <Text as="span" fontWeight="bold" fontSize="lg" color="text.link">
            {useViewText ? t("ui.view") : t("ui.manage")}
          </Text>
        </RouterLinkButton>
      </Flex>
    </Box>
  )
}
