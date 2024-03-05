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

export enum ETemplateVersionStatus {
  published = "published",
  scheduled = "scheduled",
  deprecated = "deprecated",
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
  permitType = "permit_type",
  activity = "activity",
  description = "description",
  currentVersion = "current_version",
  jurisdictionsSize = "jurisdictions_size",
}

export enum EContactSortFields {
  title = "title",
  name = "name",
  email = "email",
  phone = "phone",
  address = "address",
}

export enum EPermitApplicationSortFields {
  number = "number",
  permitClassification = "permit_classification",
  submitter = "submitter",
  submittedAt = "submitted_at",
  viewedAt = "viewed_at",
  status = "status",
}

export enum EPermitApplicationSubmitterSortFields {
  number = "number",
  permitClassification = "permit_classification",
  submitter = "submitter",
  submittedAt = "submitted_at",
  status = "status",
}

export enum EPermitApplicationReviewerSortFields {
  number = "number",
  permitClassification = "permit_classification",
  submitter = "submitter",
  viewedAt = "viewed_at",
  submittedAt = "submitted_at",
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
  number = "number",
  checkbox = "checkbox",
  select = "select",
  multiOptionSelect = "multi_option_select",
  date = "date",
  file = "file",
  phone = "phone",
  email = "email",
  radio = "radio",
  address = "address",
  bcaddress = "bcaddress",
  signature = "signature",
  textArea = "textarea",
  energyStepCode = "energy_step_code",
  generalContact = "general_contact",
  professionalContact = "professional_contact",
}

export enum ENumberUnit {
  mm = "mm",
  cm = "cm",
  m = "m",
  in = "in",
  ft = "ft",
  mi = "mi",
  sqm = "sqm",
  sqft = "sqft",
}

export enum EStepCodeChecklistStage {
  preConstruction = "pre_construction",
  midConstruction = "mid_construction",
  asBuilt = "as_built",
}

export enum EStepCodeCompliancePath {
  stepCodeERS = "step_code_ers",
  stepCodeNECB = "step_code_necb",
  passiveHouse = "passive_house",
  stepCode = "step_code",
}

export enum EStepCodeAirtightnessValue {
  twoPointFive = "two_point_five",
  threePointTwo = "three_point_two",
}

export enum EStepCodeEPCTestingTargetType {
  ach = "ach",
  nla = "nla",
  nlr = "nlr",
}

export enum EStepCodeBuildingType {
  laneway = "laneway",
  singleDetached = "single_detached",
  doulbleDetached = "double_detached",
  row = "row",
  multiPlex = "multi_plex",
  singleDetachedWithSuite = "single_detached_with_suite",
  lowRiseMURB = "low_rise_murb",
  stackedDuplex = "stacked_duplex",
  triplex = "triplex",
  retail = "retail",
  other = "other",
}
