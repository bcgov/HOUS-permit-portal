export const configurePermitInformationParam = "configurePermitInformation"

export function permitApplicationInfoPath(requirementTemplateId: string, jurisdictionId?: string | null) {
  const path = `/permit-application-info/${requirementTemplateId}`
  if (!jurisdictionId) return path
  return `${path}?jurisdictionId=${encodeURIComponent(jurisdictionId)}`
}

export function configurePermitInformationPath(requirementTemplateId: string) {
  return `/requirement-templates?${configurePermitInformationParam}=${encodeURIComponent(requirementTemplateId)}`
}
