import { Button, Dialog, Flex, Heading, Portal, useDisclosure } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { ISingleRequirementFormJson } from "../../../types/types"
import { SingleRequirementForm } from "../permit-applications/single-requirement-form"

export interface IPreviousSubmissionModalProps extends Partial<ReturnType<typeof useDisclosure>> {
  requirementJson: ISingleRequirementFormJson
  submissionData: any
}

export const PreviousSubmissionModal: React.FC<IPreviousSubmissionModalProps> = ({
  isOpen,
  onOpen,
  onClose,
  requirementJson,
  submissionData,
}) => {
  const { t } = useTranslation()

  return (
    <Dialog.Root
      open={open}
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
          <Dialog.Content mt={48}>
            <Dialog.Header textAlign="center">
              <Dialog.CloseTrigger fontSize="11px" />
              <Heading as="h3" fontSize="xl">
                {t("permitApplication.show.revision.originallySubmitted")}
              </Heading>
            </Dialog.Header>
            <Dialog.Body>
              <SingleRequirementForm requirementJson={requirementJson} submissionData={submissionData} />
              <Dialog.Footer>
                <Flex width="full" justify="center">
                  <Button variant="secondary" onClick={onClose}>
                    {t("ui.ok")}
                  </Button>
                </Flex>
              </Dialog.Footer>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
