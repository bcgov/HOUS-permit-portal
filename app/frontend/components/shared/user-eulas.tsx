import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Center,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Tag,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { WarningCircle } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useCurrentUserLicenseAgreements } from "../../hooks/resources/user-license-agreements"
import { useMst } from "../../setup/root"
import { colors } from "../../styles/theme/foundations/colors"
import { ILicenseAgreement } from "../../types/types"
import { ErrorScreen } from "./base/error-screen"
import { SharedSpinner } from "./base/shared-spinner"
import { Editor } from "./editor/editor"
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
      return <ErrorScreen error={error} />
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
      <Tag
        as={HStack}
        spacing={1.5}
        w={"fit-content"}
        px={2}
        py={1.5}
        fontSize={"sm"}
        border={"1px solid"}
        borderColor={"semantic.error"}
        bg={"semantic.errorLight"}
      >
        <WarningCircle color={colors.semantic.error} />
        <Text as={"span"}>{t("userEulas.actionRequired")}</Text>
      </Tag>
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
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Box fontSize={"sm"}>
        (
        <Button variant={"link"} onClick={onOpen}>
          {t("userEulas.pastAgreementsModal.triggerButton")}
        </Button>
        )
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxW={"800px"}>
          <ModalHeader fontSize={"2xl"}>{t("userEulas.pastAgreementsModal.title")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Accordion as={Stack} spacing={4} allowToggle allowMultiple>
              {pastLicenseAgreements.map((la) => (
                <AccordionItem
                  border={"1px solid"}
                  borderColor={"border.light"}
                  borderRadius={"sm"}
                  bg={"greys.grey04"}
                  key={la.id}
                >
                  <Box as={"h2"}>
                    <AccordionButton fontWeight={"700"}>
                      <Box as="span" flex="1" textAlign="left">
                        {t("userEulas.pastAgreementsModal.acceptedOn", {
                          timestamp: format(la.acceptedAt, "MMM dd, yyy hh:mm"),
                        })}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </Box>
                  <AccordionPanel bg={"white"} borderBottomRadius={"sm"}>
                    <Box
                      maxW="4xl"
                      overflow="hidden"
                      sx={{
                        ".quill": {
                          height: "100%",
                          overflow: "auto",
                          ".ql-editor": {
                            p: 0,
                          },
                          ".ql-container": {
                            border: "none",
                          },
                        },
                      }}
                    >
                      <Editor value={la.agreement?.content} readOnly={true} modules={{ toolbar: false }} />
                    </Box>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </ModalBody>

          <ModalFooter justifyContent={"flex-start"} mt={4}>
            <Button variant={"primary"} onClick={onClose}>
              {t("ui.close")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
})
