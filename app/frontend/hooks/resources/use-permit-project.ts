import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useMst } from "../../setup/root"
import { isUUID } from "../../utils/utility-functions"

export const usePermitProject = () => {
  const { permitProjectId } = useParams<{ permitProjectId: string }>()
  const { permitProjectStore, sandboxStore } = useMst()
  const { currentSandbox } = sandboxStore

  const { currentPermitProject, setCurrentPermitProject, fetchPermitProject } = permitProjectStore

  const [error, setError] = useState<Error | undefined>(undefined)

  useEffect(() => {
    const loadPermitProject = async () => {
      if (currentPermitProject?.id === permitProjectId && currentPermitProject.isFullyLoaded) return

      try {
        if (currentPermitProject?.id !== permitProjectId) {
          setCurrentPermitProject(null)
        }
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
    // Intentionally omit currentPermitProject from deps: including it would re-run on every MST field update.
    // permitProjectId + sandbox identify which project to load; tab/query path changes do not.
  }, [permitProjectId, currentSandbox?.id, fetchPermitProject, setCurrentPermitProject])

  return { currentPermitProject, error }
}
