import {
  Button,
  Link as ChakraLink,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react"
import { ArrowSquareOut, Users } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { IPermitProject } from "../../../../models/permit-project"
import { useMst } from "../../../../setup/root"
import { ECollaborationType } from "../../../../types/enums"
import { SharedAvatar } from "../../../shared/user/shared-avatar"

interface IProps {
  project: IPermitProject
  isOpen: boolean
  onClose: () => void
}

export const ProjectCollaboratorsSidebar = observer(function ProjectCollaboratorsSidebar({
  project,
  isOpen,
  onClose,
}: IProps) {
  const { t } = useTranslation()
  const { siteConfigurationStore, permitApplicationStore } = useMst()

  const submittedApps = permitApplicationStore.permitApplications.filter(
    (pa) => pa.projectId === project.id && pa.status !== "new_draft" && pa.status !== "revisions_requested"
  )

  const [selectedPaId, setSelectedPaId] = useState<string | null>(submittedApps[0]?.id ?? null)
  const selectedPa = selectedPaId ? permitApplicationStore.getPermitApplicationById(selectedPaId) : null

  useEffect(() => {
    if (!selectedPaId && submittedApps.length > 0) {
      setSelectedPaId(submittedApps[0].id)
    }
  }, [submittedApps.length])

  const designatedReviewerEnabled =
    siteConfigurationStore.allowDesignatedReviewer && project.jurisdiction?.allowDesignatedReviewer

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent maxW="430px" pt="var(--app-navbar-height)">
        <DrawerCloseButton />
        <DrawerHeader gap={2} alignItems="center" display="flex" mt={7} px={8} pb={0}>
          <Users size={23} />
          <Text as="h2" fontWeight={700} fontSize="2xl">
            {/* @ts-ignore */}
            {t("permitCollaboration.projectSidebar.title")}
          </Text>
        </DrawerHeader>

        <DrawerBody as={Stack} spacing={8}>
          {designatedReviewerEnabled && <ProjectReviewCollaboratorsSection project={project} />}

          <Stack spacing={4}>
            <Text as="h3" fontSize="md" fontWeight={700}>
              {/* @ts-ignore */}
              {t("permitCollaboration.projectSidebar.permitApplications")}
            </Text>

            {submittedApps.length === 0 ? (
              <Text fontSize="sm" color="text.secondary">
                {/* @ts-ignore */}
                {t("permitCollaboration.projectSidebar.noSubmittedApplications")}
              </Text>
            ) : (
              <>
                <Select size="sm" value={selectedPaId ?? ""} onChange={(e) => setSelectedPaId(e.target.value || null)}>
                  {submittedApps.map((pa) => (
                    <option key={pa.id} value={pa.id}>
                      {pa.nickname || pa.number}
                    </option>
                  ))}
                </Select>

                {selectedPa && (
                  <Stack spacing={3} p={4} bg="gray.50" borderRadius="md">
                    {designatedReviewerEnabled && (
                      <HStack spacing={3}>
                        <Text fontSize="sm" fontWeight={600} flexShrink={0}>
                          {/* @ts-ignore */}
                          {t("permitCollaboration.projectSidebar.designatedReviewer")}:
                        </Text>
                        {selectedPa.designatedReviewer?.collaborator?.user ? (
                          <HStack spacing={2}>
                            <SharedAvatar
                              size="xs"
                              name={selectedPa.designatedReviewer.collaborator.user.name}
                              role={selectedPa.designatedReviewer.collaborator.user.role}
                              fontSize="2xs"
                            />
                            <Text fontSize="sm">{selectedPa.designatedReviewer.collaborator.user.name}</Text>
                          </HStack>
                        ) : (
                          <Text fontSize="sm" color="text.secondary">
                            {/* @ts-ignore */}
                            {t("permitCollaboration.projectSidebar.noneAssigned")}
                          </Text>
                        )}
                      </HStack>
                    )}

                    <Text fontSize="sm" color="text.secondary">
                      {/* @ts-ignore */}
                      {t("permitCollaboration.projectSidebar.goToApplication")}
                    </Text>

                    <ChakraLink
                      as={Link}
                      to={`/permit-applications/${selectedPa.id}`}
                      color="text.link"
                      fontSize="sm"
                      fontWeight={600}
                      display="inline-flex"
                      alignItems="center"
                      gap={1}
                    >
                      {selectedPa.nickname || selectedPa.number}
                      <ArrowSquareOut size={14} />
                    </ChakraLink>
                  </Stack>
                )}
              </>
            )}
          </Stack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
})

const ProjectReviewCollaboratorsSection = observer(function ProjectReviewCollaboratorsSection({
  project,
}: {
  project: IPermitProject
}) {
  const { t } = useTranslation()
  const { collaboratorStore } = useMst()

  const collaborations = project.permitProjectCollaborations
  const takenIds = new Set(collaborations.map((c) => c.collaborator.id))

  useEffect(() => {
    collaboratorStore.setSearchContext(ECollaborationType.review)
    collaboratorStore.search()

    return () => {
      collaboratorStore.setSearchContext(null)
      collaboratorStore.setQuery(null)
    }
  }, [])

  const availableCollaborators = collaboratorStore.getFilteredCollaborationSearchList(takenIds)

  const handleAssign = async (collaboratorId: string) => {
    await project.assignProjectReviewCollaborator(collaboratorId)
  }

  const handleUnassign = async (collaboratorId: string) => {
    await project.unassignProjectReviewCollaborator(collaboratorId)
  }

  return (
    <Stack spacing={4} mt={6}>
      <Text as="h3" fontSize="md" fontWeight={700}>
        {/* @ts-ignore */}
        {t("permitCollaboration.projectSidebar.projectReviewCollaborators")}
      </Text>

      <Stack spacing={2}>
        {collaborations.length > 0 ? (
          collaborations.map((c) => (
            <HStack key={c.id} spacing={3} p={3} bg="gray.50" borderRadius="md" justify="space-between">
              <HStack spacing={3}>
                <SharedAvatar size="sm" name={c.collaborator.user?.name} role={c.collaborator.user?.role} />
                <Stack spacing={0}>
                  <Text fontSize="sm" fontWeight={600}>
                    {c.collaborator.user?.name}
                  </Text>
                  {c.collaborator.user?.email && (
                    <Text fontSize="xs" color="text.secondary">
                      {c.collaborator.user?.email}
                    </Text>
                  )}
                </Stack>
              </HStack>
              <Button size="xs" variant="ghost" colorScheme="red" onClick={() => handleUnassign(c.collaborator.id)}>
                {/* @ts-ignore */}
                {t("permitCollaboration.projectSidebar.unassignCollaborator")}
              </Button>
            </HStack>
          ))
        ) : (
          <Text fontSize="sm" color="text.secondary">
            {/* @ts-ignore */}
            {t("permitCollaboration.projectSidebar.noneAssigned")}
          </Text>
        )}

        {availableCollaborators.length > 0 && (
          <Stack spacing={1} maxH="200px" overflowY="auto">
            {availableCollaborators.map((collaborator) => (
              <HStack
                key={collaborator.id}
                spacing={3}
                p={2}
                borderRadius="md"
                cursor="pointer"
                _hover={{ bg: "gray.100" }}
                onClick={() => handleAssign(collaborator.id)}
              >
                <SharedAvatar size="xs" name={collaborator.user?.name} role={collaborator.user?.role} />
                <Stack spacing={0}>
                  <Text fontSize="sm">{collaborator.user?.name}</Text>
                  <Text fontSize="xs" color="text.secondary">
                    {collaborator.user?.email}
                  </Text>
                </Stack>
              </HStack>
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  )
})
