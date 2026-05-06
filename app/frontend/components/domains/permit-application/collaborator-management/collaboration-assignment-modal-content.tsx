import { Button, Dialog, Flex, HStack, IconButton, Stack, Text, useDisclosure } from "@chakra-ui/react"
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
import { SharedAvatar } from "../../../shared/user/shared-avatar"

interface ICollaborationDisplayItem {
  id?: string
  assignedRequirementBlockName?: string | null
  collaborator: {
    id: string
    user?: {
      name?: string
      email?: string
      organization?: string
      role?: string
    }
  }
}

export const CollaborationAssignmentModalContent = observer(function CollaboratorSearch({
  onSelect,
  onUnselect,
  takenCollaboratorIds = new Set<string>(),
  onClose,
  getConfirmationModalDisclosureProps,
  transitionToInvite,
  takenCollaboratorStrategy = "exclude",
  collaborationType,
  selectedCollaborations = [],
  selectedTitle,
  selectedEmptyText,
  onUnselectSelected,
  renderSelectedFooter,
  additionalCollaborations = [],
  additionalCollaboratorsTitle,
  showSearch = true,
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
  selectedCollaborations?: ICollaborationDisplayItem[]
  selectedTitle?: string
  selectedEmptyText?: string
  onUnselectSelected?: (collaboration: ICollaborationDisplayItem) => Promise<void>
  renderSelectedFooter?: (collaboration: ICollaborationDisplayItem) => React.ReactNode
  additionalCollaborations?: ICollaborationDisplayItem[]
  additionalCollaboratorsTitle?: string
  showSearch?: boolean
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
      <Dialog.Header p={4} flexShrink={0} asChild>
        <Stack>
          <Flex justifyContent={"space-between"}>
            <Text fontSize={"lg"} fontFamily={"heading"} fontWeight={"bold"}>
              {t("permitCollaboration.popover.assignment.title")}
            </Text>
            <IconButton
              size={"xs"}
              onClick={onClose}
              variant={"ghost"}
              aria-label={"close assignment screen"}
              color={"text.primary"}
            >
              <X />
            </IconButton>
          </Flex>
          {showSearch && (
            <HStack justifyContent={"space-between"} gap={4}>
              <ModelSearchInput
                searchModel={collaboratorStore as ISearch}
                inputGroupProps={{ w: transitionToInvite ? "initial" : "100%" }}
                inputProps={{ w: transitionToInvite ? "194px" : "100%", placeholder: "Find" }}
              />
              {transitionToInvite && (
                <Button variant={"secondary"} size={"sm"} fontSize={"sm"} onClick={transitionToInvite}>
                  <Plus />
                  {t("permitCollaboration.popover.assignment.newContactButton")}
                </Button>
              )}
            </HStack>
          )}
        </Stack>
      </Dialog.Header>
      <Dialog.Body p={4} overflowY="auto" flex={1} minH={0}>
        <Stack gap={4}>
          <SelectedCollaboratorsSection
            collaborations={selectedCollaborations}
            title={selectedTitle ?? t("permitCollaboration.popover.assignment.currentCollaborators")}
            emptyText={selectedEmptyText}
            onUnselect={onUnselectSelected}
            renderFooter={renderSelectedFooter}
          />
          {showSearch && (
            <Stack as={"ul"} w={"full"} listStyleType={"none"} pl={0} m={0}>
              {collaboratorSearchList.length === 0 && (
                <Text textAlign={"center"} fontSize={"sm"} color={"text.secondary"} fontStyle={"italic"}>
                  {t(
                    `permitCollaboration.popover.assignment.noResultsText.${transitionToInvite ? "invitable" : "default"}`
                  )}
                </Text>
              )}
              {collaboratorSearchList.map((collaborator) => {
                return (
                  <HStack
                    key={collaborator.id}
                    as={"li"}
                    w="full"
                    px={2}
                    py={"0.375rem"}
                    fontSize={"sm"}
                    color={"text.primary"}
                    justifyContent={"space-between"}
                    borderRadius={"sm"}
                    _hover={{
                      bg: "theme.blueLight",
                    }}
                  >
                    <HStack gap={2} minW={0}>
                      <SharedAvatar size="xs" name={collaborator.user?.name} role={collaborator.user?.role} />
                      <Stack gap={0} minW={0}>
                        <Text fontSize="sm" fontWeight={600} lineClamp={1}>
                          {collaborator.user?.name}
                        </Text>
                        {collaborator.user?.email && (
                          <Text fontSize="xs" color="text.secondary" lineClamp={1}>
                            {collaborator.user.email}
                          </Text>
                        )}
                      </Stack>
                    </HStack>
                    {takenCollaboratorIds.has(collaborator.id) ? (
                      <Button
                        variant={"ghost"}
                        color={"text.link"}
                        size={"sm"}
                        ml={3}
                        flexShrink={0}
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
                            ml={3}
                            flexShrink={0}
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
                        ml={3}
                        flexShrink={0}
                        fontWeight={"semibold"}
                        fontSize={"sm"}
                        onClick={() => onSelectCreator(collaborator.id)()}
                      >
                        {t("ui.select")}
                      </RequestLoadingButton>
                    )}
                  </HStack>
                )
              })}
            </Stack>
          )}
          <AdditionalCollaboratorsSection
            collaborations={additionalCollaborations}
            title={additionalCollaboratorsTitle ?? t("permitCollaboration.popover.assignment.additionalCollaborators")}
          />
        </Stack>
      </Dialog.Body>
    </>
  )
})

const SelectedCollaboratorsSection = observer(function SelectedCollaboratorsSection({
  collaborations,
  title,
  emptyText,
  onUnselect,
  renderFooter,
}: {
  collaborations: ICollaborationDisplayItem[]
  title: string
  emptyText?: string
  onUnselect?: (collaboration: ICollaborationDisplayItem) => Promise<void>
  renderFooter?: (collaboration: ICollaborationDisplayItem) => React.ReactNode
}) {
  const { t } = useTranslation()

  if (collaborations.length === 0 && !emptyText) {
    return null
  }

  return (
    <Stack gap={2}>
      <Text fontSize="xs" fontWeight={700} color="text.secondary" textTransform="uppercase">
        {title}
      </Text>
      {collaborations.length === 0 ? (
        <Text fontSize="sm" color="text.secondary">
          {emptyText}
        </Text>
      ) : (
        collaborations.map((collaboration) => (
          <Stack key={collaboration.id ?? collaboration.collaborator.id} gap={2} p={2} bg="gray.50" borderRadius="md">
            <HStack gap={3} justify="space-between">
              <HStack gap={2} minW={0}>
                <SharedAvatar
                  size="xs"
                  name={collaboration.collaborator.user?.name}
                  role={collaboration.collaborator.user?.role}
                />
                <Stack gap={0} minW={0}>
                  <Text fontSize="sm" fontWeight={600} lineClamp={1}>
                    {collaboration.collaborator.user?.name}
                  </Text>
                  {collaboration.collaborator.user?.organization && (
                    <Text fontSize="xs" color="text.secondary" lineClamp={1}>
                      {collaboration.collaborator.user.organization}
                    </Text>
                  )}
                </Stack>
              </HStack>
              {onUnselect && (
                <RequestLoadingButton
                  size="xs"
                  variant="ghost"
                  colorPalette="red"
                  flexShrink={0}
                  onClick={() => onUnselect(collaboration)}
                >
                  {t("permitCollaboration.projectSidebar.unassignCollaborator")}
                </RequestLoadingButton>
              )}
            </HStack>
            {renderFooter?.(collaboration)}
          </Stack>
        ))
      )}
    </Stack>
  )
})

const AdditionalCollaboratorsSection = observer(function AdditionalCollaboratorsSection({
  collaborations,
  title,
}: {
  collaborations: ICollaborationDisplayItem[]
  title: string
}) {
  const groupedCollaborations = Array.from(
    collaborations
      .reduce<Map<string, ICollaborationDisplayItem[]>>((acc, collaboration) => {
        const collaboratorId = collaboration.collaborator.id
        const existing = acc.get(collaboratorId) ?? []
        existing.push(collaboration)
        acc.set(collaboratorId, existing)
        return acc
      }, new Map())
      .values()
  )

  if (groupedCollaborations.length === 0) {
    return null
  }

  return (
    <>
      <Stack gap={2}>
        <Text fontSize="xs" fontWeight={700} color="text.secondary" textTransform="uppercase">
          {title}
        </Text>
        {groupedCollaborations.map((collaborations) => {
          const firstCollaboration = collaborations[0]
          const blockNames = collaborations
            .map((collaboration) => collaboration.assignedRequirementBlockName)
            .filter(Boolean)
            .join(", ")
          return (
            <HStack key={firstCollaboration.collaborator.id} gap={2} p={2} bg="gray.50" borderRadius="md" minW={0}>
              <SharedAvatar
                size="xs"
                name={firstCollaboration.collaborator.user?.name}
                role={firstCollaboration.collaborator.user?.role}
              />
              <Stack gap={0} minW={0}>
                <Text fontSize="sm" fontWeight={600} lineClamp={1}>
                  {firstCollaboration.collaborator.user?.name}
                </Text>
                {blockNames && (
                  <Text fontSize="xs" color="text.secondary" lineClamp={1}>
                    {blockNames}
                  </Text>
                )}
              </Stack>
            </HStack>
          )
        })}
      </Stack>
    </>
  )
})
