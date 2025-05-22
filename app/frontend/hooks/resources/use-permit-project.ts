import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useParams } from "react-router-dom"
import { useMst } from "../../setup/root"
import { isUUID } from "../../utils/utility-functions"

export const usePermitProject = () => {
  const { permitProjectId } = useParams<{ permitProjectId: string }>()
  const { pathname } = useLocation()
  const { permitProjectStore, sandboxStore } = useMst()
  const { currentSandbox } = sandboxStore

  const { currentPermitProject, setCurrentPermitProject, fetchPermitProject } = permitProjectStore

  const [error, setError] = useState<Error | undefined>(undefined)
  const { t } = useTranslation()

  useEffect(() => {
    const loadPermitProject = async () => {
      try {
        setCurrentPermitProject(null)
        if (isUUID(permitProjectId)) {
          const project = await fetchPermitProject(permitProjectId)
          if (project) {
            setCurrentPermitProject(project.id)
            setError(null)
          } else {
            setError(new Error("Failed to fetch project details."))
          }
        }
      } catch (e) {
        console.error("Failed to fetch permit project:", e)
        setError(new Error("An error occurred while fetching project details."))
      }
    }

    loadPermitProject()

    // Cleanup function to clear the current project when the component unmounts or dependencies change
    return () => {
      // Assuming you have a method like clearCurrentPermitProject in your store
      // permitProjectStore.clearCurrentPermitProject();
    }
  }, [permitProjectId, pathname, currentSandbox?.id, fetchPermitProject, setCurrentPermitProject, t])

  return { currentPermitProject, error }
}
