import {
  Accordion,
  Box,
  Button,
  Center,
  Dialog,
  HStack,
  Heading,
  Portal,
  Stack,
  Tag,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react"
import { Warning, WarningCircle } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useCurrentUserLicenseAgreements } from "../../hooks/resources/user-license-agreements"
import { useMst } from "../../setup/root"
import { colors } from "../../styles/theme/foundations/colors"
import { ILicenseAgreement } from "../../types/types"
import { SharedSpinner } from "./base/shared-spinner"
import { SafeTipTapDisplay } from "./editor/safe-tiptap-display"
import { RouterLinkButton } from "./navigation/router-link-button"

export const UserEulas = observer(function UserEulas() {
  const { userStore } = useMst()
  const { t } = useTranslation()
  const currentUser = userStore.currentUser
  const currentEulaAccepted = currentUser?.eulaAccepted
  const { error, licenseAgreements, isLoading, currentEula } = useCurrentUserLicenseAgreements()

  const subContent = useMemo(() => {
    if (isLoading) {
      return (
        <Center>
          <SharedSpinner my={3} />
        </Center>
      )
    }

    if (error) {
      return (
        <Center w="full" flex={1} color="greys.grey01">
          <VStack>
            <Warning size={100} />
            <Text>{error?.message}</Text>
          </VStack>
        </Center>
      )
    }

    const acceptedLicenseAgreement = licenseAgreements?.find((la) => la.agreement?.id === currentEula?.id)

    return acceptedLicenseAgreement ? (
      <Text color={"text.secondary"} fontSize={"sm"}>
        {t("userEulas.acceptedOn", {
          date: format(acceptedLicenseAgreement.acceptedAt, "MMM dd, yyy"),
          time: format(acceptedLicenseAgreement.acceptedAt, "hh:mm"),
        })}
      </Text>
    ) : (
      <Tag.Root
        gap={1.5}
        w={"fit-content"}
        px={2}
        py={1.5}
        fontSize={"sm"}
        border={"1px solid"}
        borderColor={"semantic.error"}
        bg={"semantic.errorLight"}
        asChild
      >
        <HStack>
          <WarningCircle color={colors.semantic.error} />
          <Text as={"span"}>{t("userEulas.actionRequired")}</Text>
        </HStack>
      </Tag.Root>
    )
  }, [isLoading, error, licenseAgreements, currentEula])

  const pastLicenseAgreements = useMemo(() => {
    return licenseAgreements?.filter((la) => la.agreement?.id !== currentEula?.id) ?? []
  }, [isLoading, error, licenseAgreements, currentEula])

  if (!isLoading && !error && !currentEula) {
    return null
  }

  return (
    <HStack
      as={"section"}
      p={6}
      border={"1px solid"}
      borderColor={"border.light"}
      borderRadius={"sm"}
      justifyContent={"space-between"}
    >
      <Stack flex={isLoading || error ? 1 : undefined} gap={currentEulaAccepted ? 1 : 2}>
        <HStack>
          <Heading as="h3" m={0}>
            {t("userEulas.title")}
          </Heading>
          {pastLicenseAgreements.length > 0 && <PastEulasModal pastLicenseAgreements={pastLicenseAgreements} />}
        </HStack>
        {subContent}
      </Stack>
      {isLoading || error ? null : (
        <RouterLinkButton to={"/profile/eula"} variant={currentEulaAccepted ? "secondary" : "primary"}>
          {currentEulaAccepted ? t("userEulas.view") : t("userEulas.viewAgreement")}
        </RouterLinkButton>
      )}
    </HStack>
  )
})

export const PastEulasModal = observer(function PastEulasModal({
  pastLicenseAgreements,
}: {
  pastLicenseAgreements: ILicenseAgreement[]
}) {
  const { t } = useTranslation()
  const { open, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Box fontSize={"sm"}>
        (
        <Button variant={"link"} onClick={onOpen}>
          {t("userEulas.pastAgreementsModal.triggerButton")}
        </Button>
        )
      </Box>
      <Dialog.Root
        open={open}
        onOpenChange={(e) => {
          if (!e.open) {
            onClose()
          }
        }}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW={"800px"}>
              <Dialog.Header fontSize={"2xl"}>{t("userEulas.pastAgreementsModal.title")}</Dialog.Header>
              <Dialog.CloseTrigger />
              <Dialog.Body>
                <Accordion.Root gap={4} collapsible multiple asChild>
                  <Stack>
                    {pastLicenseAgreements.map((la) => (
                      <Accordion.Item
                        border={"1px solid"}
                        borderColor={"border.light"}
                        borderRadius={"sm"}
                        bg={"greys.grey04"}
                        key={la.id}
                        value="item-0"
                      >
                        <Box as={"h2"}>
                          <Accordion.ItemTrigger fontWeight={"700"}>
                            <Box as="span" flex="1" textAlign="left">
                              {t("userEulas.pastAgreementsModal.acceptedOn", {
                                timestamp: format(la.acceptedAt, "MMM dd, yyy hh:mm"),
                              })}
                            </Box>
                            <Accordion.ItemIndicator />
                          </Accordion.ItemTrigger>
                        </Box>
                        <Accordion.ItemContent bg={"white"} borderBottomRadius={"sm"}>
                          <Accordion.ItemBody>
                            <Box maxW="4xl" overflow="hidden">
                              {/* Use SafeTipTapDisplay for safe HTML rendering */}
                              <SafeTipTapDisplay htmlContent={la.agreement?.content} />
                            </Box>
                          </Accordion.ItemBody>
                        </Accordion.ItemContent>
                      </Accordion.Item>
                    ))}
                  </Stack>
                </Accordion.Root>
              </Dialog.Body>
              <Dialog.Footer justifyContent={"flex-start"} mt={4}>
                <Button variant={"primary"} onClick={onClose}>
                  {t("ui.close")}
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
})
