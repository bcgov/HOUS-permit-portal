import { Box, Button, Dialog, Flex, Portal, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitCollaboration } from "../../../models/permit-collaboration"

interface IProps {
  isOpen?: boolean
  open?: boolean
  onClose: () => void
  designatedReviewer?: IPermitCollaboration
}

export const DesignatedReviewerModal = observer(({ isOpen, open, onClose, designatedReviewer }: IProps) => {
  const { t } = useTranslation()
  const user = designatedReviewer?.collaborator?.user
  const name = user?.name
  const organization = user?.organization

  if (!user) return null

  return (
    <Dialog.Root
      open={open ?? isOpen ?? false}
      size="lg"
      placement="center"
      onOpenChange={(e) => {
        if (!e.open) {
          onClose()
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Flex align="center" gap={4}>
                {t("permitApplication.show.revision.designatedReviewerModal.title")}
              </Flex>
            </Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <Text>{t("permitApplication.show.revision.designatedReviewerModal.body")}</Text>
              <Box borderWidth={1} borderColor="border.light" borderRadius="sm" p={4} mt={6}>
                <Text fontSize="sm" color="text.secondary" textTransform="uppercase">
                  {t("permitApplication.show.revision.designatedReviewerModal.designatedReviewer")}
                </Text>
                <Text fontWeight="bold" fontSize="lg" mt={1}>
                  {name}
                </Text>
                {organization && <Text color="text.secondary">{`{${organization}}`}</Text>}
              </Box>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="primary" onClick={onClose}>
                {t("ui.okay")}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
})
