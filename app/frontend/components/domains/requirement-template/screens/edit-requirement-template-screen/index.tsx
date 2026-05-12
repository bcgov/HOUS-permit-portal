import { observer } from "mobx-react-lite"
import React from "react"
import { PublishScheduleModal } from "../../publish-schedule-modal"
import {
  BaseEditRequirementTemplateScreen,
  IEditRequirementActionsProps,
} from "../base-edit-requirement-template-screen"

export interface IEditRequirementTemplateScreenRenderActionProps extends Partial<IEditRequirementActionsProps> {}

export const EditRequirementTemplateScreen = observer(function EditRequirementTemplateScreen() {
  return <BaseEditRequirementTemplateScreen renderActions={(props) => <PublishScheduleModal {...props} />} />
})
