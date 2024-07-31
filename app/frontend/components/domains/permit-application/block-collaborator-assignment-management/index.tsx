import { Avatar, Box, HStack, Stack, Tooltip } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { createPortal } from "react-dom"
import { IPermitApplication } from "../../../../models/permit-application"
import { ECollaborationType } from "../../../../types/enums"
import { CollaboratorAssignmentPopover } from "./collaborator-assignment-popover"

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
        <HStack mr={6}>
          <CollaboratorAssignmentPopover
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
          spacing={1}
          onClick={(e) => e.stopPropagation()}
          cursor={"auto"}
        >
          {existingAssignments.map((assignment) => (
            <Box as={"li"} key={assignment.id} pl={0}>
              <Tooltip label={assignment.collaborator?.user?.name}>
                <Avatar name={assignment.collaborator?.user?.name} size={"sm"} />
              </Tooltip>
            </Box>
          ))}
        </Stack>,
        attachmentNode
      )}
    </>
  )
})
