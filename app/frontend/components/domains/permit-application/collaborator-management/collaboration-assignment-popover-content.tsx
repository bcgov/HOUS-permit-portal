import {
  Button,
  Flex,
  HStack,
  IconButton,
  PopoverBody,
  PopoverHeader,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { Plus, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { ISearch } from "../../../../lib/create-search-model"
import { useMst } from "../../../../setup/root"
import { ECollaborationType } from "../../../../types/enums"
import { ModelSearchInput } from "../../../shared/base/model-search-input"
import { ConfirmationModal } from "../../../shared/confirmation-modal"
import { RequestLoadingButton } from "../../../shared/request-loading-button"

export const CollaborationAssignmentPopoverContent = observer(function CollaboratorSearch({
  onSelect,
  onUnselect,
  takenCollaboratorIds = new Set<string>(),
  onClose,
  getConfirmationModalDisclosureProps,
  transitionToInvite,
  takenCollaboratorStrategy = "exclude",
  collaborationType,
}: {
  onSelect: (collaboratorId?: string) => Promise<void>
  onUnselect?: (collaboratorId?: string) => Promise<void>
  takenCollaboratorIds?: Set<string>
  takenCollaboratorStrategy?: "include" | "exclude"
  onClose?: () => void
  getConfirmationModalDisclosureProps?: (
    collaboratorId: string
  ) => Partial<Omit<ReturnType<typeof useDisclosure>, "onToggle">>
  transitionToInvite?: () => void
  collaborationType: ECollaborationType
}) {
  const { collaboratorStore } = useMst()
  const collaboratorSearchList =
    takenCollaboratorStrategy === "exclude"
      ? collaboratorStore.getFilteredCollaborationSearchList(takenCollaboratorIds)
      : collaboratorStore.collaboratorSearchList
  const { t } = useTranslation()

  useEffect(() => {
    collaboratorStore.setSearchContext(collaborationType)

    return () => collaboratorStore.setSearchContext(null)
  }, [])

  useEffect(() => {
    collaboratorStore.search()
    return () => collaboratorStore.setQuery(null)
  }, [])

  const onSelectCreator = (collaboratorId: string) => {
    return async (onClose?: () => void) => {
      await onSelect(collaboratorId)
      onClose?.()
    }
  }

  return (
    <>
      <PopoverHeader as={Stack} p={4}>
        <Flex justifyContent={"space-between"}>
          <Text fontSize={"lg"} fontFamily={"heading"} fontWeight={"bold"}>
            {t("permitCollaboration.popover.assignment.title")}
          </Text>
          <IconButton
            size={"xs"}
            onClick={onClose}
            variant={"ghost"}
            aria-label={"close assignment screen"}
            icon={<X />}
            color={"text.primary"}
          />
        </Flex>
        <HStack justifyContent={"space-between"} spacing={4}>
          <ModelSearchInput
            searchModel={collaboratorStore as ISearch}
            inputGroupProps={{ w: transitionToInvite ? "initial" : "100%" }}
            inputProps={{ w: transitionToInvite ? "194px" : "100%", placeholder: "Find" }}
          />
          {transitionToInvite && (
            <Button variant={"secondary"} leftIcon={<Plus />} size={"sm"} fontSize={"sm"} onClick={transitionToInvite}>
              {t("permitCollaboration.popover.assignment.newContactButton")}
            </Button>
          )}
        </HStack>
      </PopoverHeader>
      <PopoverBody p={4}>
        <Stack as={"ul"} w={"full"} listStyleType={"none"} pl={0}>
          {collaboratorSearchList.length === 0 && (
            <Text textAlign={"center"} fontSize={"sm"} color={"text.secondary"} fontStyle={"italic"}>
              {t(
                `permitCollaboration.popover.assignment.noResultsText.${transitionToInvite ? "invitable" : "default"}`
              )}
            </Text>
          )}
          {collaboratorSearchList.map((collaborator) => {
            return (
              <Text
                key={collaborator.id}
                as={"li"}
                px={2}
                py={"0.375rem"}
                fontSize={"sm"}
                fontWeight={"bold"}
                color={"text.link"}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"space-between"}
                borderRadius={"sm"}
                _hover={{
                  bg: "theme.blueLight",
                }}
              >
                {collaborator.user?.name}
                {takenCollaboratorIds.has(collaborator.id) ? (
                  <Button
                    variant={"ghost"}
                    color={"text.link"}
                    size={"sm"}
                    fontWeight={"semibold"}
                    fontSize={"sm"}
                    onClick={() => onUnselect?.(collaborator.id)}
                  >
                    {t("permitCollaboration.popover.collaborations.unassignButton")}
                  </Button>
                ) : collaborationType === ECollaborationType.submission ? (
                  <ConfirmationModal
                    title={t("permitCollaboration.popover.assignment.inviteWarning.title")}
                    body={t("permitCollaboration.popover.assignment.inviteWarning.body")}
                    triggerText={t("ui.proceed")}
                    renderTriggerButton={({ onClick, ...rest }) => (
                      <Button
                        variant={"ghost"}
                        color={"text.link"}
                        size={"sm"}
                        fontWeight={"semibold"}
                        fontSize={"sm"}
                        onClick={onClick}
                        {...rest}
                      >
                        {t("ui.select")}
                      </Button>
                    )}
                    renderConfirmationButton={({ onClick }) => (
                      <RequestLoadingButton variant={"primary"} onClick={onClick as () => Promise<any>}>
                        {t("ui.confirm")}
                      </RequestLoadingButton>
                    )}
                    onConfirm={onSelectCreator(collaborator.id)}
                    modalControlProps={getConfirmationModalDisclosureProps(collaborator.id)}
                    modalContentProps={{
                      maxW: "700px",
                    }}
                  />
                ) : (
                  <RequestLoadingButton
                    variant={"ghost"}
                    color={"text.link"}
                    size={"sm"}
                    fontWeight={"semibold"}
                    fontSize={"sm"}
                    onClick={() => onSelectCreator(collaborator.id)()}
                  >
                    {t("ui.select")}
                  </RequestLoadingButton>
                )}
              </Text>
            )
          })}
        </Stack>
      </PopoverBody>
    </>
  )
})
