import {
  Button,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Stack,
  Text,
  usePopoverContext,
} from "@chakra-ui/react"
import { Users } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { ISearch } from "../../../lib/create-search-model"
import { IPermitApplication } from "../../../models/permit-application"
import { useMst } from "../../../setup/root"
import { ECollaborationType, ECollaboratorType } from "../../../types/enums"
import { ModelSearchInput } from "../../shared/base/model-search-input"
import { ConfirmationModal } from "../../shared/confirmation-modal"

interface IProps {
  permitApplication: IPermitApplication
  collaborationType: ECollaborationType
  requirementBlockId: string
}

export const CollaboratorAssignmentPopover = observer(function AssignmentPopover({
  permitApplication,
  collaborationType,
  requirementBlockId,
}: IProps) {
  const { collaboratorStore } = useMst()
  const { collaboratorSearchList } = collaboratorStore
  const existingAssignments = permitApplication.getCollaborationAssigneesByBlockId(
    collaborationType,
    requirementBlockId
  )
  const existingCollaboratorIds = new Set<string>(existingAssignments.map((a) => a.collaborator.id))

  return (
    <Popover placement={"bottom-start"}>
      <PopoverTrigger>
        <Button
          onClick={(e) => {
            e.stopPropagation()
          }}
          onKeyDown={(e) => {
            e.stopPropagation()
          }}
          leftIcon={<Users />}
          variant={"link"}
        >
          <Text as={"span"} textDecoration={"underline"}>
            Assign ({existingAssignments.length})
          </Text>
        </Button>
      </PopoverTrigger>
      <Portal>
        <PopoverContent w={"370px"} maxW={"370px"}>
          <CollaboratorSearch
            onSelect={(collaboratorId) =>
              permitApplication.assignCollaborator(collaboratorId, ECollaboratorType.assignee, requirementBlockId)
            }
            takenCollaboratorIds={existingCollaboratorIds}
          />
        </PopoverContent>
      </Portal>
    </Popover>
  )
})

const CollaboratorSearch = observer(function CollaboratorSearch({
  onSelect,
  takenCollaboratorIds = new Set<string>(),
}: {
  onSelect?: (collaboratorId?: string) => void | Promise<void>
  takenCollaboratorIds?: Set<string>
}) {
  const { collaboratorStore } = useMst()
  const collaboratorSearchList = collaboratorStore.getFilteredCollaborationSearchList(takenCollaboratorIds)
  const { t } = useTranslation()
  const { isOpen } = usePopoverContext()

  useEffect(() => {
    isOpen ? collaboratorStore.search() : collaboratorStore.setQuery(null)
  }, [isOpen])

  return (
    <>
      <PopoverHeader as={Stack} p={4}>
        <Text fontSize={"lg"} fontFamily={"heading"} fontWeight={"bold"}>
          Assign a collaborator
        </Text>
        <ModelSearchInput searchModel={collaboratorStore as ISearch} inputProps={{ placeholder: "Find" }} />
      </PopoverHeader>
      <PopoverBody p={4}>
        <Stack as={"ul"} w={"full"} listStyleType={"none"} pl={0}>
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
              >
                {collaborator.user?.name}
                <ConfirmationModal
                  title={"Some title"}
                  body={"Some body that I used to know"}
                  triggerText={t("ui.proceed")}
                  renderTriggerButton={(props) => (
                    <Button
                      variant={"ghost"}
                      color={"text.link"}
                      size={"sm"}
                      fontWeight={"semibold"}
                      fontSize={"sm"}
                      {...props}
                    >
                      {t("ui.select")}{" "}
                    </Button>
                  )}
                  onConfirm={(onClose) => {
                    onSelect?.(collaborator.id)
                    onClose()
                  }}
                />
              </Text>
            )
          })}
        </Stack>
      </PopoverBody>
    </>
  )
})
