import { BoxProps, Flex, Heading, LinkBox, LinkOverlay, Text } from "@chakra-ui/react"
import { CaretRight } from "@phosphor-icons/react"
import React, { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"

interface IHomeScreenBoxProps extends BoxProps {
  icon: ReactNode
  href: string
  title: string
  description: string
  linkText?: string
}

export const HomeScreenBox = ({ icon, title, description, href, linkText, ...rest }: IHomeScreenBoxProps) => {
  const { t } = useTranslation()

  return (
    <LinkBox
      as="section"
      borderRadius="lg"
      borderWidth={1}
      borderColor="border.light"
      p={6}
      w="full"
      className="jumbo-buttons"
      position="relative"
      transition="border-color 200ms ease-out, background-color 200ms ease-out"
      _hover={{
        borderColor: "theme.blueAlt",
        backgroundColor: "theme.BlueLight",
      }}
      {...rest}
    >
      <Flex direction={{ base: "column", md: "row" }} gap={8} align="center">
        <Flex direction="column" gap={3} flex={1}>
          <Flex align="center" color="text.link">
            {icon}
            <Heading as="h3" ml={2} mb={0} size="md">
              {title}
            </Heading>
          </Flex>
          <Text ml={8} fontSize="sm" color="gray.600">
            {description}
          </Text>
        </Flex>
        <LinkOverlay
          as={RouterLinkButton}
          to={href}
          variant="link"
          rightIcon={<CaretRight size={16} />}
          fontWeight="bold"
          fontSize="lg"
        >
          {linkText || t("ui.manage")}
        </LinkOverlay>
      </Flex>
    </LinkBox>
  )
}
