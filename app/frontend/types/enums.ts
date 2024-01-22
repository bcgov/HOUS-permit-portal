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

export enum ESortDirection {
  ascending = "asc",
  descending = "desc",
}

export enum ETagType {
  requirementBlock = "RequirementBlock",
}

export enum ERequirementType {
  text = "text",
  address = "address",
  date = "date",
  number = "number",
  textArea = "text_area",
  radio = "radio",
  multiSelectCheckbox = "multi_select_checkbox",
  select = "select",
  signature = "signature",
  generalContact = "general_contact",
  fileUpload = "file_upload",
}

export enum ENumberUnit {
  mm = "mm",
  cm = "cm",
  m = "m",
  in = "in",
  ft = "ft",
  mi = "mi",
}
