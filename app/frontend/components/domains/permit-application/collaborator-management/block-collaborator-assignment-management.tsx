import { Tooltip } from "@/components/ui/tooltip"
import { Avatar, Box, HStack, Stack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { IPermitApplication } from "../../../../models/permit-application"
import { ECollaborationType, EPermitBlockStatus } from "../../../../types/enums"
import { BlockStatusSelect } from "../../../shared/select/selectors/block-status-select"
import { CollaboratorAssignmentModal } from "./collaborator-assignment-modal"

export interface IRequirementBlockAssignmentNode {
  requirementBlockId: string
  panelNode: HTMLElement
  attachmentNode: HTMLElement
}

interface IProps {
  requirementBlockAssignmentNode: IRequirementBlockAssignmentNode
  permitApplication: IPermitApplication
  collaborationType: ECollaborationType
}

export const BlockCollaboratorAssignmentManagement = observer(function BlockCollaboratorAssignmentManagement({
  requirementBlockAssignmentNode,
  permitApplication,
  collaborationType,
}: IProps) {
  const { requirementBlockId, attachmentNode } = requirementBlockAssignmentNode
  const existingAssignments = permitApplication.getCollaborationAssigneesByBlockId(
    collaborationType,
    requirementBlockId
  )
  return (
    <>
      {createPortal(
        <HStack mr={6} gap={6} onClick={(e) => e.stopPropagation()}>
          <StatusSelect
            permitApplication={permitApplication}
            collaborationType={collaborationType}
            requirementBlockId={requirementBlockId}
          />
          <CollaboratorAssignmentModal
            permitApplication={permitApplication}
            collaborationType={collaborationType}
            requirementBlockId={requirementBlockId}
          />
        </HStack>,
        attachmentNode
      )}
      {createPortal(
        <Stack
          as={"ul"}
          top={0}
          right={"-48px"}
          position={"absolute"}
          listStyleType={"none"}
          pl={0}
          gap={1}
          onClick={(e) => e.stopPropagation()}
          cursor={"auto"}
        >
          {existingAssignments.map((assignment) => (
            <Box as={"li"} key={assignment.id} pl={0}>
              <Tooltip content={assignment.collaborator?.user?.name}>
                <Avatar.Root size={"sm"}>
                  <Avatar.Fallback name={assignment.collaborator?.user?.name} />
                </Avatar.Root>
              </Tooltip>
            </Box>
          ))}
        </Stack>,
        attachmentNode
      )}
    </>
  )
})

const StatusSelect = observer(function StatusSelect({
  permitApplication,
  collaborationType,
  requirementBlockId,
}: {
  permitApplication: IPermitApplication
  collaborationType: ECollaborationType
  requirementBlockId: string
}) {
  const permitBlockStatus = permitApplication.getPermitBlockStatus(collaborationType, requirementBlockId)

  const [status, setStatus] = useState<EPermitBlockStatus>(permitBlockStatus?.status || EPermitBlockStatus.draft)

  useEffect(() => {
    setStatus(permitBlockStatus?.status || EPermitBlockStatus.draft)
  }, [permitBlockStatus?.status])

  const onChange = async (newStatus: EPermitBlockStatus) => {
    const originalStatus = permitBlockStatus?.status || EPermitBlockStatus.draft
    try {
      setStatus(newStatus)

      const response = await permitApplication.createOrUpdatePermitBlockStatus(
        requirementBlockId,
        newStatus,
        collaborationType
      )

      if (!response) {
        setStatus(originalStatus)
      }
    } catch (e) {
      setStatus(originalStatus)
    }
  }

  const isDisabled =
    collaborationType === ECollaborationType.review ? !permitApplication.isSubmitted : !permitApplication.isDraft

  return (
    <BlockStatusSelect
      value={status}
      onChange={onChange}
      isSelectionDisabled={isDisabled}
      isTriggerDisabled={isDisabled}
    />
  )
})
