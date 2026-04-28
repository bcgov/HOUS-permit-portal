import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../../models/permit-application"
import { useMst } from "../../../../setup/root"
import { ECollaborationType } from "../../../../types/enums"
import { DesignatedCollaboratorAssignmentModal } from "../../permit-application/collaborator-management/designated-collaborator-assignment-modal"
import { renderAssignPlusIconTrigger, ReviewAssigneesRow } from "./review-assignees-row"

export const ApplicationReviewAssigneesCell = observer(function ApplicationReviewAssigneesCell({
  application,
}: {
  application: IPermitApplication
}) {
  const { t } = useTranslation()
  const { permitApplicationStore } = useMst()
  const primaryAssignee = application.designatedReviewer?.collaborator?.user ?? null
  const additionalCollaborations = application.getCollaborationAssignees(ECollaborationType.review)

  return (
    <ReviewAssigneesRow primaryAssignee={primaryAssignee} emptyText={t("ui.unassigned")}>
      <DesignatedCollaboratorAssignmentModal
        permitApplication={application}
        collaborationType={ECollaborationType.review}
        additionalCollaborations={additionalCollaborations}
        onBeforeOpen={async () => {
          await permitApplicationStore.fetchPermitApplication(application.id, true)
        }}
        renderTrigger={renderAssignPlusIconTrigger({ ariaLabel: t("permitCollaboration.sidebar.title") })}
      />
    </ReviewAssigneesRow>
  )
})
