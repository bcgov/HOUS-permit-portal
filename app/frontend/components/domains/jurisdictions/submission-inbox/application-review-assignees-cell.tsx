import { observer } from "mobx-react-lite"
import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../../models/permit-application"
import { IUser } from "../../../../models/user"
import { useMst } from "../../../../setup/root"
import { ECollaborationType } from "../../../../types/enums"
import { DesignatedCollaboratorAssignmentPopover } from "../../permit-application/collaborator-management/designated-collaborator-assignment-popover"
import { renderAssignPlusIconTrigger, ReviewAssigneesRow } from "./review-assignees-row"

const MAX_VISIBLE_BLOCK_LEVEL_REVIEW_ASSIGNEE_AVATARS = 3

export const ApplicationReviewAssigneesCell = observer(function ApplicationReviewAssigneesCell({
  application,
}: {
  application: IPermitApplication
}) {
  const { t } = useTranslation()
  const { permitApplicationStore } = useMst()
  const primaryAssignee = application.designatedReviewer?.collaborator?.user ?? null

  const secondaryAssignees = useMemo(() => {
    const seenUserIds = new Set<string>(primaryAssignee ? [primaryAssignee.id] : [])
    const users: IUser[] = []

    application.getCollaborationAssignees(ECollaborationType.review).forEach((collaboration) => {
      const user = collaboration.collaborator?.user
      if (user && !seenUserIds.has(user.id)) {
        seenUserIds.add(user.id)
        users.push(user)
      }
    })

    return users
  }, [application, primaryAssignee])

  return (
    <ReviewAssigneesRow
      primaryAssignee={primaryAssignee}
      secondaryAssignees={secondaryAssignees}
      maxSecondaryVisible={MAX_VISIBLE_BLOCK_LEVEL_REVIEW_ASSIGNEE_AVATARS}
      emptyText={t("ui.unassigned")}
    >
      <DesignatedCollaboratorAssignmentPopover
        permitApplication={application}
        collaborationType={ECollaborationType.review}
        onBeforeOpen={async () => {
          await permitApplicationStore.fetchPermitApplication(application.id, true)
        }}
        renderTrigger={renderAssignPlusIconTrigger({ ariaLabel: t("permitCollaboration.sidebar.title") })}
      />
    </ReviewAssigneesRow>
  )
})
