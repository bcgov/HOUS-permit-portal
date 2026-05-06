import {
  Box,
  BoxProps,
  Button,
  ButtonProps,
  Drawer,
  Flex,
  HStack,
  Heading,
  IconButton,
  Link,
  Portal,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { CaretRight, Envelope, Info } from "@phosphor-icons/react"
import React, { ReactNode, Ref, useRef } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../setup/root"
import { SectionBox } from "../domains/home/section-box"

interface IProps {
  defaultButtonProps?: Partial<ButtonProps>
  renderTriggerButton?: (props: ButtonProps & { ref: Ref<HTMLElement> }) => JSX.Element
}

export function HelpDrawer({ defaultButtonProps, renderTriggerButton }: IProps) {
  const { t } = useTranslation()
  const { siteConfigurationStore } = useMst()
  const { open, onOpen, onClose } = useDisclosure()
  const btnRef = useRef<HTMLButtonElement>()

  const { shownHelpLinkItems } = siteConfigurationStore

  return (
    <>
      {renderTriggerButton?.({ onClick: onOpen, ref: btnRef }) ?? (
        <Button
          variant={"ghost"}
          position="fixed"
          top="0px"
          right="20px"
          p={0}
          onClick={onOpen}
          aria-label={"open help drawer"}
          _hover={{
            textDecoration: "underline",
          }}
          {...defaultButtonProps}
        >
          {t("ui.help")}
        </Button>
      )}
      <Drawer.Root
        open={open}
        finalFocusEl={() => btnRef.current}
        placement={"right"}
        onOpenChange={(e) => {
          if (!e.open) {
            onClose()
          }
        }}
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content display={"flex"} flexDir={"column"} h={"full"} maxW={"430px"}>
              <Drawer.CloseTrigger fontSize={"xs"} />
              <Drawer.Header display={"flex"} alignItems={"center"} p={6} pt={10} fontSize={"2xl"}>
                {t("ui.help")}
              </Drawer.Header>
              <Drawer.Body>
                {shownHelpLinkItems && (
                  <Flex direction="column" gap={6}>
                    {shownHelpLinkItems.map((item) => (
                      <HelpDrawerBox
                        key={item.href}
                        icon={<Info size={24} />}
                        href={item.href}
                        title={item.title}
                        description={item.description}
                        p={4}
                      />
                    ))}
                  </Flex>
                )}
                <Box w="full" boxShadow="md" mt={6} border="1px solid" borderRadius="md" borderColor="border.light">
                  <Flex direction="column">
                    <Box background="theme.blueAlt" borderTopRadius="md" color="white" p={4} fontWeight="bold">
                      {t("site.needMoreHelp")}
                    </Box>
                    <Box p={4}>
                      <Text>{t("site.pleaseContact")}</Text>
                      <br />
                      <Text>{t("site.forHelp")}</Text>

                      <HStack w="full" py={4}>
                        <Box bg="theme.blueAlt" borderRadius="full" p="6px" w="8">
                          <Envelope weight="fill" size="full" color="white" />
                        </Box>
                        <Link href={`mailto:digital.codes.permits@gov.bc.ca`}>digital.codes.permits@gov.bc.ca</Link>
                      </HStack>
                    </Box>
                  </Flex>
                </Box>
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </>
  )
}

interface IHelpDrawerBoxProps extends BoxProps {
  icon: ReactNode
  href: string
  title: string
  description: string
  linkText?: string
}

export const HelpDrawerBox = ({ icon, title, description, href, linkText, ...rest }: IHelpDrawerBoxProps) => {
  const { t } = useTranslation()

  return (
    <SectionBox {...rest}>
      <Flex gap={8} align="center">
        <Flex direction="column" gap={3} flex={1}>
          <HStack align="center" color="text.link">
            <Box w={6}>{icon}</Box>
            <Heading as="h3" mb={0} fontSize="lg">
              {title}
            </Heading>
          </HStack>
          <Text ml={8} fontSize="sm">
            {description}
          </Text>
        </Flex>
        <Link href={href} target="_blank" rel="noopener noreferrer">
          <IconButton variant="tertiary" aria-label={"external-link"}>
            <CaretRight size={24} style={{ color: "var(--chakra-colors-text-link)" }} />
          </IconButton>
        </Link>
      </Flex>
    </SectionBox>
  )
}
