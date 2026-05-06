import { Box, Button, Dialog, Flex, Heading, HStack, Portal, Text, TextProps, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../models/permit-application"
import { useMst } from "../../../setup/root"
import SandboxHeader from "../sandbox/sandbox-header"

interface IProps {
  permitApplication: IPermitApplication
  isOpen?: boolean
  open?: boolean
  onClose: () => void
  onSubmit?: () => void
}

export const PermitApplicationSubmitModal = observer(function PermitApplicationSubmitModal({
  permitApplication,
  isOpen,
  open,
  onSubmit,
  onClose,
}: IProps) {
  const { userStore } = useMst()
  const currentUser = userStore.currentUser
  const { t } = useTranslation()

  return (
    <Dialog.Root
      open={open ?? isOpen ?? false}
      size="xl"
      onOpenChange={(e) => {
        if (!e.open) {
          onClose()
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content border={permitApplication.sandbox ? "8px solid" : 0} borderColor="background.sandboxBase">
            <Dialog.Header>
              <Dialog.CloseTrigger fontSize="11px" />
              {permitApplication.sandbox && (
                <SandboxHeader
                  borderTopRadius={0}
                  borderBottomRadius="lg"
                  top="100%"
                  bottom={0}
                  mx={-2}
                  override
                  sandbox={permitApplication.sandbox}
                />
              )}
            </Dialog.Header>
            <Dialog.Body py={6}>
              {permitApplication.canUserSubmit(currentUser) ? (
                <Flex direction="column" gap={8}>
                  <Heading as="h3">{t("permitApplication.new.ready")}</Heading>
                  <Box
                    borderRadius="md"
                    border="1px solid"
                    borderColor="semantic.warning"
                    backgroundColor="semantic.warningLight"
                    px={6}
                    py={3}
                  >
                    <Heading as="h3" fontSize="lg">
                      {t("permitApplication.new.bySubmitting")}
                    </Heading>
                    <Text>{t("permitApplication.new.confirmation")}</Text>
                  </Box>
                  <Flex justify="center" gap={6}>
                    <Button onClick={onSubmit} variant="primary">
                      {t("ui.submit")}
                    </Button>
                    <Button onClick={onClose} variant="secondary">
                      {t("ui.neverMind")}
                    </Button>
                  </Flex>
                </Flex>
              ) : (
                <CollaboratorSubmitBlockModalContent permitApplication={permitApplication} onDismiss={onClose} />
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
})

const CollaboratorSubmitBlockModalContent = observer(function CollaboratorSubmitBlockModalBodyContent({
  permitApplication,
  onDismiss,
}: {
  permitApplication: IPermitApplication
  onDismiss: () => void
}) {
  const { t } = useTranslation()

  const submitter = permitApplication.submitter
  const delegatee = permitApplication.delegatee

  return (
    <VStack gap={8} textAlign={"center"}>
      <Heading as="h3" fontSize={"2xl"}>
        {t("permitApplication.submissionBlockModal.title")}
      </Heading>
      <Text textAlign={"center"}> {t("permitApplication.submissionBlockModal.description")}</Text>
      <HStack justifyContent={"center"} w={"full"} gap={6} alignItems={"stretch"}>
        <CollaboratorSubmitBlockModalCard
          title={t("permitApplication.submissionBlockModal.designatedSubmitter")}
          name={delegatee?.name}
          organization={delegatee?.organization}
        />

        <CollaboratorSubmitBlockModalCard
          title={t("permitApplication.submissionBlockModal.author")}
          name={submitter?.name}
          organization={submitter?.organization || "some organization"}
        />
      </HStack>
      <Button
        variant={"primary"}
        onClick={(e) => {
          e.stopPropagation()
          onDismiss()
        }}
      >
        {t("ui.okay")}
      </Button>
    </VStack>
  )
})

const cardContainerProps = {
  gap: 4,
  p: 3,
  border: "1px solid",
  borderColor: "border.light",
  borderRadius: "sm",
  w: "50%",
  maxW: "258px",
}
const cardTextProps: Partial<TextProps> = {
  textTransform: "uppercase",
  color: "text.secondary",
  fontSize: "sm",
}

function CollaboratorSubmitBlockModalCard({
  title,
  name,
  organization,
}: {
  title: string
  name: string
  organization?: string
}) {
  return (
    <VStack {...cardContainerProps}>
      <Text {...cardTextProps}>{title}</Text>
      <Box>
        {name && <Text fontWeight={700}>{name}</Text>}
        {organization && <Text>{organization}</Text>}
      </Box>
    </VStack>
  )
}
