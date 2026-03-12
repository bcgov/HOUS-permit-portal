import { observer } from "mobx-react-lite"
import React from "react"
import { useSearch } from "../../../hooks/use-search"
import { IPermitProject } from "../../../models/permit-project"
import { useMst } from "../../../setup/root"

interface IProps {
  permitProject: IPermitProject
}

export const ActivityTabPanelContent = observer(({ permitProject }: IProps) => {
  const { projectAuditStore } = useMst()
  useSearch(projectAuditStore, [permitProject.id])

  return <></>
})
