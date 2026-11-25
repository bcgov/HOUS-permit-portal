import { useEffect } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { EStepCodeType } from "../../../types/enums"
import { isUUID } from "../../../utils/utility-functions"

const partForType = {
  [EStepCodeType.part3StepCode]: "part-3-step-code",
  [EStepCodeType.part9StepCode]: "part-9-step-code",
} as const

type StepCodePart = (typeof partForType)[EStepCodeType]

export function useRedirectAttachedStepCode(
  part: StepCodePart,
  stepCode?: { id: string; type?: string; permitApplicationId?: string | null } | null
) {
  const { permitApplicationId, stepCodeId } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isStandaloneRecord = !permitApplicationId && isUUID(stepCodeId)
  const loadedForRoute = isStandaloneRecord
    ? stepCode?.id === stepCodeId
    : !!permitApplicationId && stepCode?.permitApplicationId === permitApplicationId
  const targetPart = loadedForRoute ? partForType[stepCode?.type as EStepCodeType] : undefined
  const attachedPermitId = loadedForRoute ? stepCode?.permitApplicationId : null
  const needsRedirect = !!targetPart && (targetPart !== part || (!!attachedPermitId && isStandaloneRecord))

  useEffect(() => {
    if (!needsRedirect || !targetPart || !stepCode) return

    const prefix = isStandaloneRecord
      ? `/${part}/${stepCodeId}`
      : `/permit-applications/${permitApplicationId}/edit/${part}`
    if (!pathname.startsWith(prefix)) return

    const suffix = pathname.slice(prefix.length)
    const next = attachedPermitId
      ? `/permit-applications/${attachedPermitId}/edit/${targetPart}${suffix}`
      : `/${targetPart}/${stepCode.id}${suffix}`

    if (next !== pathname) navigate(next, { replace: true })
  }, [
    attachedPermitId,
    isStandaloneRecord,
    needsRedirect,
    navigate,
    part,
    pathname,
    permitApplicationId,
    stepCode,
    stepCodeId,
    targetPart,
  ])

  return (isStandaloneRecord && stepCode?.id !== stepCodeId) || needsRedirect
}
