import { Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { IPermitProject } from "../../../models/permit-project"
import { useMst } from "../../../setup/root"
import { EProjectAccess, EProjectContactDesignation } from "../../../types/enums"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { AddProjectPersonForm } from "./add-project-person-form"

interface IAddProjectPersonModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string | null
  onCreated?: () => void
}

export const AddProjectPersonModal = observer(function AddProjectPersonModal({
  isOpen,
  onClose,
  projectId,
  onCreated,
}: IAddProjectPersonModalProps) {
  const { permitProjectStore } = useMst()
  const [project, setProject] = useState<IPermitProject | null>(null)

  useEffect(() => {
    if (!isOpen || !projectId) return
    let cancelled = false
    const cached = permitProjectStore.permitProjectMap.get(projectId) ?? null
    if (cached) {
      permitProjectStore.setCurrentPermitProject(cached.id)
      setProject(cached)
    }
    void permitProjectStore.fetchPermitProject(projectId).then((loaded) => {
      if (cancelled || !loaded) return
      permitProjectStore.setCurrentPermitProject(loaded.id)
      setProject(loaded)
    })
    return () => {
      cancelled = true
    }
  }, [isOpen, projectId])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody px={8} py={8}>
          {isOpen && project ? (
            <AddProjectPersonForm
              permitProject={project}
              onCancel={onClose}
              onCreated={() => {
                onCreated?.()
                onClose()
              }}
              defaultContactDesignation={EProjectContactDesignation.none}
              defaultAccess={EProjectAccess.limited}
            />
          ) : (
            <Flex justify="center" py={10}>
              <SharedSpinner />
            </Flex>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
})
