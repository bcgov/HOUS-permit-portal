import { Box, Flex, Heading, Text } from "@chakra-ui/react"
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React from "react"
import { useTranslation } from "react-i18next"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"

interface IHomeScreenBoxProps {
  icon: IconProp
  href: string
  title: string
  description: string
  useViewText?: boolean
}

export const HomeScreenBox = ({ icon, title, description, href, useViewText }: IHomeScreenBoxProps) => {
  const { t } = useTranslation()

  return (
    <Box as="section" borderRadius="lg" border="1px solid" borderColor="border.light" p={6} w="full">
      <Flex direction={{ base: "column", md: "row" }} gap={8} align="center">
        <Flex direction="column" gap={3} flex={1}>
          <Flex color="text.link">
            <FontAwesomeIcon style={{ height: 24, width: 24 }} icon={icon} />
            <Heading fontSize="xl" ml={2}>
              {title}
            </Heading>
          </Flex>
          <Text ml={8}>{description}</Text>
        </Flex>
        <RouterLinkButton
          to={href}
          variant="tertiary"
          rightIcon={<FontAwesomeIcon style={{ height: 14, width: 14 }} icon={faChevronRight} />}
        >
          <Heading fontSize="lg" color="text.link">
            {useViewText ? t("ui.view") : t("ui.manage")}
          </Heading>
        </RouterLinkButton>
      </Flex>
    </Box>
  )
}
