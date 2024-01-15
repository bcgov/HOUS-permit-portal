export enum EFlashMessageStatus {
  error = "error",
  success = "success",
  warning = "warning",
  info = "info",
}

export enum EPermitType {
  residential = "residential",
}

export enum EBuildingType {
  detatched = "detatched",
  semiDetatched = "semi_detatched",
  smallAppartment = "small_appartment",
}

export enum EPermitApplicationStatus {
  draft = "draft",
  submitted = "submitted",
  viewed = "viewed",
}

export enum EUserRoles {
  submitter = "submitter",
  reviewManager = "review_manager",
  reviewer = "reviewer",
  superAdmin = "super_admin",
}

export enum ERequirementLibrarySortFields {
  name = "name",
  associations = "associations",
  requirementLabels = "requirement_labels",
  updatedAt = "updated_at",
}

export enum ESortDirection {
  ascending = "asc",
  descending = "desc",
}

export enum ETagType {
  requirementBlock = "RequirementBlock",
}
