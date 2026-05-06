import { Button, Dialog, Portal, Stack, Text, useDisclosure } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { EUserRoles } from "../../types/enums"

export function UserRolesExplanationModal() {
  const { t } = useTranslation()
  const { open, onOpen, onClose } = useDisclosure()
  const rolesToExplain = [
    EUserRoles.submitter,
    EUserRoles.reviewManager,
    EUserRoles.reviewer,
    EUserRoles.technicalSupport,
  ]
  return (
    <>
      <Button onClick={onOpen} variant={"link"} textDecoration={"underline"}>
        {t("user.rolesAndPermissions")}
      </Button>
      <Dialog.Root
        open={open}
        scrollBehavior="inside"
        onOpenChange={(e) => {
          if (!e.open) {
            onClose()
          }
        }}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW={"container.md"}>
              <Dialog.Header>{t("user.rolesAndPermissions")}</Dialog.Header>
              <Dialog.CloseTrigger />
              <Dialog.Body>
                <Stack as={"ul"} listStyleType={"none"} gap={4} pl={0} pb={4}>
                  {rolesToExplain.map((role) => (
                    <Text as={"li"} key={role}>
                      <Text as={"span"} fontWeight={700} textTransform={"capitalize"}>
                        {t(`user.roles.${role}`)}:
                      </Text>{" "}
                      {t(`user.rolesExplanation.${role}`)}
                    </Text>
                  ))}
                </Stack>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}
