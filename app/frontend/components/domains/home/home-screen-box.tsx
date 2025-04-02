import { BoxProps, Flex, Heading, LinkBox, LinkOverlay, Text } from "@chakra-ui/react"
import { CaretRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import SandboxHeader from "../../shared/sandbox/sandbox-header"

interface IHomeScreenBoxProps extends BoxProps {
  icon: ReactNode
  href: string
  title: string
  description: string
  linkText?: string
  markForSandbox?: boolean
  disableForSandbox?: boolean
}

export const HomeScreenBox = observer(
  ({ icon, title, description, href, linkText, markForSandbox, disableForSandbox, ...rest }: IHomeScreenBoxProps) => {
    const { t } = useTranslation()

    const { sandboxStore } = useMst()
    const { isSandboxActive } = sandboxStore

    const isDisabled = disableForSandbox && isSandboxActive
    const isMarked = markForSandbox

    return (
      <LinkBox
        as="section"
        borderRadius="lg"
        borderWidth={1}
        borderColor="border.light"
        p={8}
        w="full"
        className="jumbo-buttons"
        position="relative"
        opacity={isDisabled ? 0.75 : 1}
        pointerEvents={isDisabled ? "none" : "auto"}
        transition="border-color 200ms ease-out, background-color 200ms ease-out"
        _hover={{
          borderColor: "theme.blueAlt",
          backgroundColor: "theme.BlueLight",
          cursor: "pointer",
        }}
        {...rest}
      >
        {isMarked && <SandboxHeader />}

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
          {isDisabled ? (
            <Text fontWeight="bold" color="greys.grey01" maxW={100}>
              {t("sandbox.disabledFor")}
            </Text>
          ) : (
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
          )}
        </Flex>
      </LinkBox>
    )
  }
)
