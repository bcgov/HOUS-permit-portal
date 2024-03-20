import {
  Button,
  ButtonGroup,
  ButtonProps,
  HStack,
  MenuItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { SlidersHorizontal } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IRequirementAttributes } from "../../../../types/api-request"

interface IProps {
  triggerButtonProps?: Partial<ButtonProps>
  renderTriggerButton?: (props: ButtonProps) => JSX.Element
  conditional: IRequirementAttributes["inputOptions"]["conditional"]
}

export function ConditionalSetupModal({ triggerButtonProps, renderTriggerButton, conditional }: IProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation()
  return (
    <>
      {renderTriggerButton ? (
        renderTriggerButton({ onClick: onOpen })
      ) : (
        <MenuItem color={"text.primary"} onClick={onOpen} isDisabled={!conditional} {...triggerButtonProps}>
          <HStack spacing={2} fontSize={"sm"}>
            <SlidersHorizontal />
            <Text as={"span"}>{t("requirementsLibrary.modals.optionsMenu.conditionalLogic")}</Text>
          </HStack>
        </MenuItem>
      )}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxW={"600px"} fontSize={"sm"} color={"text.secondary"}>
          <ModalCloseButton />
          <ModalHeader
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            bg={"greys.grey03"}
            borderTopRadius={"md"}
          >
            <SlidersHorizontal style={{ marginRight: "var(--chakra-space-2)" }} />
            {t("requirementsLibrary.modals.optionsMenu.conditionalLogic")}
          </ModalHeader>
          <ModalBody
            py={4}
            sx={{
              pre: {
                bg: "greys.grey03",
                px: 4,
                py: 3,
                borderRadius: "sm",
                color: "text.primary",
              },
            }}
          >
            <pre>{JSON.stringify(conditional, null, 2)}</pre>
          </ModalBody>

          <ModalFooter justifyContent={"flex-start"}>
            <ButtonGroup>
              <Button variant={"primary"} isDisabled>
                {t("ui.onlySave")}
              </Button>
              <Button variant={"secondary"} onClick={onClose}>
                {t("ui.cancel")}
              </Button>
              <Button variant={"ghost"} isDisabled>
                {t("ui.reset")}
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
