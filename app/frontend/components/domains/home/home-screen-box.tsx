import { BoxProps, Flex, Heading, Text } from "@chakra-ui/react"
import { CaretRight } from "@phosphor-icons/react"
import React, { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { SectionBox } from "./section-box"

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
    <SectionBox {...rest}>
      <Flex direction={{ base: "column", md: "row" }} gap={8} align="center">
        <Flex direction="column" gap={3} flex={1}>
          <Flex color="text.link">
            {icon}
            <Heading as="h3" fontSize="xl" ml={2}>
              {title}
            </Heading>
          </Flex>
          <Text ml={8} fontSize="sm">
            {description}
          </Text>
        </Flex>
        <RouterLinkButton to={href} variant="tertiary" rightIcon={<CaretRight size={16} />}>
          <Heading as="h3" fontSize="lg" color="text.link">
            {linkText || t("ui.manage")}
          </Heading>
        </RouterLinkButton>
      </Flex>
    </SectionBox>
  )
}
