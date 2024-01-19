export enum EFlashMessageStatus {
  error = "error",
  success = "success",
  warning = "warning",
  info = "info",
}

export enum EPermitClassificationType {
  PermitType = "PermitType",
  Activity = "Activity",
}

export enum EPermitApplicationStatus {
  draft = "draft",
  submitted = "submitted",
  viewed = "viewed",
}

export enum ERequirementTemplateStatus {
  published = "published",
  scheduled = "scheduled",
  draft = "draft",
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

export enum EJurisdictionSortFields {
  reverseQualifiedName = "reverse_qualified_name",
  reviewManagersSize = "review_managers_size",
  reviewersSize = "reviewers_size",
  permitApplicationsSize = "permit_applications_size",
  templatesUsed = "templates_used",
}

export enum EUserSortFields {
  role = "role",
  email = "email",
  name = "name",
  createdAt = "created_at",
  lastSignIn = "last_sign_in",
}

export enum ERequirementTemplateSortFields {
  status = "status",
  permitType = "permit_type",
  activityType = "activity_type",
  description = "description",
  version = "version",
  jurisdictionsSize = "jurisdictions_size",
}

export enum ESortDirection {
  ascending = "asc",
  descending = "desc",
}
