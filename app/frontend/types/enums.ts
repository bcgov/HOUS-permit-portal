export enum EFlashMessageStatus {
  error = "error",
  success = "success",
  warning = "warning",
  info = "info",
  special = "special",
}

export enum EPreviewStatus {
  invited = "invited",
  access = "access",
  expired = "expired",
  revoked = "revoked",
}

export enum EPermitClassificationType {
  PermitType = "PermitType",
  Activity = "Activity",
}

export enum ERequirementTemplateType {
  EarlyAccessRequirementTemplate = "EarlyAccessRequirementTemplate",
  LiveRequirementTemplate = "LiveRequirementTemplate",
}

export enum EFileUploadAttachmentType {
  RequirementDocument = "RequirementDocument",
  SupportingDocument = "SupportingDocument",
  ProjectDocument = "ProjectDocument",
  ReportDocument = "ReportDocument",
  ResourceDocument = "ResourceDocument",
  DesignDocument = "DesignDocument",
  PdfForm = "PdfForm",
  OverheatingDocument = "OverheatingDocument",
}

export enum EResourceCategory {
  planningZoning = "planning_zoning",
  bylawsRequirements = "bylaws_requirements",
  gisMapping = "gis_mapping",
  additionalResources = "additional_resources",
}

export enum EResourceType {
  file = "file",
  link = "link",
}

export enum EPermitApplicationStatus {
  newDraft = "new_draft",
  newlySubmitted = "newly_submitted",
  revisionsRequested = "revisions_requested",
  resubmitted = "resubmitted",
  ephemeral = "ephemeral",
}

export enum EPermitApplicationStatusGroup {
  draft = "draft",
  submitted = "submitted",
}

export enum ETemplateVersionStatus {
  published = "published",
  scheduled = "scheduled",
  deprecated = "deprecated",
  draft = "draft",
}

export enum ExternalApiKeyStatus {
  active = "active",
  notActive = "notActive",
}

export enum EUserRoles {
  submitter = "submitter",
  regionalReviewManager = "regional_review_manager",
  reviewManager = "review_manager",
  reviewer = "reviewer",
  superAdmin = "super_admin",
  technicalSupport = "technical_support",
}

export enum ERequirementLibrarySortFields {
  name = "name",
  firstNations = "first_nations",
  associations = "associations",
  requirementLabels = "requirement_labels",
  updatedAt = "updated_at",
  configurations = "configurations",
}

export enum EJurisdictionTypes {
  subDistrict = "SubDistrict",
  regionalDistrict = "RegionalDistrict",
}

export enum EJurisdictionSortFields {
  reverseQualifiedName = "reverse_qualified_name",
  reviewManagersSize = "review_managers_size",
  reviewersSize = "reviewers_size",
  permitApplicationsSize = "permit_applications_size",
  regionalDistrict = "regional_district_name",
  inboxEnabled = "inbox_enabled",
}

export enum EUserSortFields {
  role = "role",
  email = "email",
  name = "name",
  createdAt = "created_at",
  lastSignInAt = "last_sign_in_at",
}

export enum ERequirementTemplateSortFields {
  permitType = "permit_type",
  activity = "activity",
  firstNations = "first_nations",
  description = "description",
  currentVersion = "current_version",
  usedBy = "used_by",
}

export enum EPreCheckSortFields {
  fullAddress = "full_address",
  title = "title",
  updatedAt = "updated_at",
  status = "status",
}

export enum EEarlyAccessRequirementTemplateSortFields {
  nickname = "nickname",
  permitType = "permit_type",
  activity = "activity",
  firstNations = "first_nations",
  sharedWith = "shared_with",
  updatedAt = "updated_at",
  assignee = "assignee",
}

export enum EContactSortFields {
  title = "role/position",
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

export enum EProjectPermitApplicationSortFields {
  permit = "permit",
  assignedTo = "assigned_to",
  permitApplicationNumber = "permit_application_number",
  updatedAt = "updated_at",
  status = "status",
}

export enum EPermitApplicationSubmitterSortFields {
  number = "number",
  permitClassification = "permit_classification",
  submitter = "submitter",
  submittedAt = "submitted_at",
  viewedAt = "viewed_at",
  status = "status",
  createdAt = "created_at",
  updatedAt = "updated_at",
}

export enum EPermitApplicationReviewerSortFields {
  status = "status",
  number = "number",
  referenceNumber = "reference_number",
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
  radio = "radio",
  address = "address",
  bcaddress = "bcaddress",
  signature = "signature",
  textArea = "textarea",
  energyStepCodePart9 = "energy_step_code",
  energyStepCodePart3 = "energy_step_code_part_3",
  pidInfo = "pid_info",
  phone = "phone",
  email = "email",
  generalContact = "general_contact",
  professionalContact = "professional_contact",
  multiplySumGrid = "multiply_sum_grid",
  architecturalDrawing = "architectural_drawing",
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
  cad = "cad",
}

export enum EPermitBlockStatus {
  draft = "draft",
  inProgress = "in_progress",
  ready = "ready",
}

export enum EStepCodeChecklistStage {
  preConstruction = "pre_construction",
  midConstruction = "mid_construction",
  asBuilt = "as_built",
}

export enum EStepCodeChecklistStatus {
  draf = "draft",
  complete = "complete",
}

export enum EStepCodeCompliancePath {
  stepCodeERS = "step_code_ers",
  stepCodeNECB = "step_code_necb",
  passiveHouse = "passive_house",
  stepCode = "step_code",
}

export enum EStepCodePrescriptiveValue {
  zeroCarbon = "zero_carbon",
  carbon = "carbon",
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

export enum ESpaceHeatingCoolingVariant {
  principal = "principal",
  secondary = "secondary",
}

export enum EWindowsGlazedDoorsPerformanceType {
  usi = "usi",
  uimp = "u_imp",
}

export enum EDoorsPerformanceType {
  rsi = "rsi",
  usi = "usi",
}

export enum ESpaceHeatingCoolingPerformanceType {
  afue = "afue",
  hspf = "hspf",
  sse = "sse",
  cop = "cop",
  seer = "seer",
}

export enum EHotWaterPerformanceType {
  percentEff = "percent_eff",
  afue = "afue",
  uef = "uef",
  ef = "ef",
  eer = "eer",
}

export enum EFossilFuelsPresence {
  yes = "yes",
  no = "no",
  unknown = "unknown",
}

export enum EEnergyStep {
  two = "2",
  three = "3",
  four = "4",
  five = "5",
}

export enum EZeroCarbonStep {
  zero = "0",
  one = "1",
  two = "2",
  three = "3",
  four = "4",
}

export enum ERequirementContactFieldItemType {
  contactType = "contactType",
  firstName = "firstName",
  lastName = "lastName",
  email = "email",
  phone = "phone",
  title = "title",
  address = "address",
  organization = "organization",
  businessName = "businessName",
  businessLicense = "businessLicense",
  professionalAssociation = "professionalAssociation",
  professionalNumber = "professionalNumber",
}

export enum EGovFeedbackResponseNoReason {
  unclear = "This information is unclear",
  missingInfo = "This page is missing the information I need",
  notRelated = "This page is not related to what I searched for",
  other = "Other",
}

export enum ESocketDomainTypes {
  notification = "notification",
  permitApplication = "permit_application",
  template_version = "template_version",
  jurisdiction = "jurisdiction",
}

export enum ESocketEventTypes {
  update = "update",
  new = "new",
}

export enum EPermitApplicationSocketEventTypes {
  updateCompliance = "update_compliance",
  updateSupportingDocuments = "update_supporting_documents",
  updatePermitBlockStatus = "update_permit_block_status",
}

export enum EJurisdictionSocketEventTypes {
  unviewedSubmissionsCountUpdated = "unviewed_submissions_count_updated",
}

export enum EEnabledElectiveFieldReason {
  bylaw = "bylaw",
  zoning = "zoning",
  policy = "policy",
}

export enum ECustomEvents {
  handlePermitApplicationUpdate = "handlePermitApplicationUpdate",
  openRequestRevision = "openRequestRevision",
  openPreviousSubmission = "openPreviousSubmission",
}

export enum EExportFormat {
  csv = "csv",
  json = "json",
}

export enum EReportingColumns {
  name = "name",
  description = "description",
  href = "href",
}

export enum EEnergyStepCodeDependencyRequirementCode {
  energyStepCodeMethod = "energy_step_code_method",
  energyStepCodeToolPart9 = "energy_step_code_tool_part_9",
  energyStepCodeReportFile = "energy_step_code_report_file",
  energyStepCodeH2000File = "energy_step_code_h2000_file",
}

export enum EEnergyStepCodePart3DependencyRequirementCode {
  energyStepCodeMethod = "energy_step_code_method",
  energyStepCodeToolPart3 = "energy_step_code_tool_part_3",
  energyStepCodeReportFile = "energy_step_code_report_file",
}

export enum EArchitecturalDrawingDependencyRequirementCode {
  architecturalDrawingMethod = "architectural_drawing_method",
  architecturalDrawingTool = "architectural_drawing_tool",
  architecturalDrawingFile = "architectural_drawing_file",
}

export enum EAutoComplianceModule {
  DigitalSealValidator = "DigitalSealValidator",
  ParcelInfoExtractor = "ParcelInfoExtractor",
  PermitApplication = "PermitApplication",
  HistoricSite = "HistoricSite",
}

export enum EAutoComplianceType {
  fileValidator = "file_validator",
  externalValueExtractor = "external_value_extractor",
  internalValueExtractor = "internal_value_extractor",
  externalOptionsMapper = "external_options_mapper",
}

export enum EDeprecationReason {
  newPublish = "new_publish",
  unscheduled = "unscheduled",
}

export enum EFollowableTypes {
  permitTemplate = "PermitTemplate",
}

export enum ERequirementChangeAction {
  added = "added",
  changed = "changed",
  removed = "removed",
}

export enum ENotificationActionType {
  newTemplateVersionPublish = "new_template_version_publish",
  publishedTemplateMissingRequirementsMapping = "published_template_missing_requirements_mapping",
  scheduledTemplateMissingRequirementsMapping = "scheduled_template_missing_requirements_mapping",
  customizationUpdate = "customization_update",
  submissionCollaborationAssignment = "submission_collaboration_assignment",
  submissionCollaborationUnassignment = "submission_collaboration_unassignment",
  reviewCollaborationAssignment = "review_collaboration_assignment",
  reviewCollaborationUnassignment = "review_collaboration_unassignment",
  permitBlockStatusReady = "permit_block_status_ready",
  applicationSubmission = "application_submission",
  applicationRevisionsRequest = "application_revisions_request",
  applicationView = "application_view",
  stepCodeReportGenerated = "step_code_report_generated",
  preCheckSubmitted = "pre_check_submitted",
  preCheckCompleted = "pre_check_completed",
  fileUploadFailed = "file_upload_failed",
  resourceReminder = "resource_reminder",
}

export enum ECollaboratorableType {
  Jurisdiction = "Jurisdiction",
  User = "User",
}

export enum ECollaborationType {
  submission = "submission",
  review = "review",
}

export enum ECollaboratorType {
  delegatee = "delegatee",
  assignee = "assignee",
}

export enum EVisibility {
  live = "live",
  earlyAccess = "early_access",
  any = "any",
}

export enum EJurisdictionExternalApiState {
  jOn = "j_on",
  jOff = "j_off",
  gOff = "g_off",
}

export enum EPermitApplicationReviewStatus {
  ReadyForReview = "ready_for_review",
}

export enum EClimateZone {
  zone4 = "zone_4",
  zone5 = "zone_5",
  zone6 = "zone_6",
  zone7a = "zone_7a",
  zone7b = "zone_7b",
  zone8 = "zone_8",
}

export enum EBuildingCodeVersion {
  BCBC2002 = "BCBC_2024",
  BCBC2018Rev5 = "BCBC_2018_rev_5",
  BCBC2018Rev4 = "BCBC_2018_rev_4",
  BCBC2018Rev3 = "BCBC_2018_rev_3",
  BCBC2018Rev2 = "BCBC_2018_rev_2",
  BCBC2018Rev1 = "BCBC_2018_rev_1",
}

export enum EProjectStage {
  newDraft = "new_draft",
  newlySubmitted = "newly_submitted",
  revisionsRequested = "revisions_requested",
  resubmitted = "resubmitted",
}

export enum EBaselineOccupancyKey {
  performingArtsAssembly = "performing_arts_assembly",
  otherAssembly = "other_assembly",
  arenaAssembly = "arena_assembly",
  openAirassembly = "open_air_assembly",
  detention = "detention",
  treatment = "treatment",
  care = "care",
  highHazardindustrial = "high_hazard_industrial",
  mediumHazardIndustrial = "medium_hazard_industrial",
  lowHazardIndustrial = "low_hazard_industrial",
}

export enum EStepCodeOccupancyKey {
  hotelMotel = "hotel_motel",
  residential = "residential",
  office = "office",
  other = "other",
  mercantile = "mercantile",
}

export enum EBaselinePerformanceRequirement {
  step2NECB = "step_2_necb",
  ASHRAE = "ashrae",
  percentBetterAshrae = "%_better_ashrae",
  NECB = "necb",
  percentBetterNECB = "%_better_necb",
}
export enum EIsSuiteSubMetered {
  yes = "yes",
  no = "no",
  notApplicable = "not_applicable",
}

export enum EPart3StepCodeSoftware {
  IESVE = "ies_ve",
  energyPlus = "energy_plus",
  designBuilder = "design_builder",
  openStudio = "open_studio",
  eQuest = "e_quest",
  DOE2Other = "doe_2_other",
  PHPP = "phpp",
  other = "other",
}

export enum EPart3BuildingType {
  mixedUse = "mixedUse",
  stepCode = "stepCode",
  baseline = "baseline",
}

export enum EHeatingSystemPlant {
  none = "none",
  airSourceHeatPump = "air_source_heat_pump",
  groundSourceHeatPump = "ground_source_heat_pump",
  airSourceVRF = "air_source_vrf",
  groundSourceVRF = "ground_source_vrf",
  gasBoiler = "gas_boiler",
  districtSystem = "district_system",
  other = "other",
}

export enum EHeatingSystemType {
  electricBaseboard = "electric_baseboard",
  hydronicBasebaord = "hydronic_basebaord",
  hydronicFanCoils = "hydronic_fan_coils",
  VAVReheat = "vav_reheat",
  airSourceHeatPump = "air_source_heat_pump",
  VRFUnits = "vrf_units",
  radiantFloorCooling = "radiant_floor_cooling",
  gasFiredRooftop = "gas_fired_rooftop",
  electricResistanceRooftop = "electric_resistance_rooftop",
  heatPumpRooftop = "heat_pump_rooftop",
  other = "other",
}

export enum ECoolingSystemPlant {
  none = "none",
  airCooledChiller = "air_cooled_chiller",
  waterCooledChiller = "water_cooled_chiller",
  airSourceHeatPump = "air_source_heat_pump",
  groundSourceHeatPump = "ground_source_heat_pump",
  airSourceVRF = "air_source_vrf",
  groundSourceVRF = "ground_source_vrf",
  other = "other",
}

export enum ECoolingSystemType {
  ptac = "ptac",
  hydronicFanCoils = "hydronic_fan_coils",
  hydronicBaseboards = "hydronic_baseboards",
  VRFUnits = "vrf_units",
  radiantFloorCeiling = "radiant_floor_ceiling",
  none = "none",
  other = "other",
}

export enum EDHWSystemType {
  heatPumpSpaceHeating = "heat_pump_space_heating",
  airSourceHeatPump = "air_source_heat_pump",
  groundSourcHeatPump = "ground_source_heat_pump",
  gasSpaceHeating = "gas_space_heating",
  gas = "gas",
  suiteElectric = "suite_electric",
  suiteGas = "suite_gas",
  other = "other",
}

export enum EFuelType {
  electricity = "electricity",
  naturalGas = "natural_gas",
  districtEnergy = "district_energy",
  propane = "propane",
  lightFuelOil = "light_fuel_oil",
  heavyFuelOil = "heavy_fuel_oil",
  dieselFuel = "diesel_fuel",
  woodFuel = "wood_fuel",
  other = "other",
}

export enum EEnergyOutputUseType {
  interiorLighting = "interior_lighting",
  exteriorLighting = "exterior_lighting",
  heatingGeneral = "heating_general",
  cooling = "cooling",
  pumps = "pumps",
  fans = "fans",
  domesticHotWater = "domestic_hot_water",
  plugLoads = "plug_loads",
  other = "other",
}

export enum EEnergyOutputSource {
  modelled = "modelled",
  reference = "reference",
}

export enum EDocumentReferenceDocumentType {
  architecturalDrawing = "architectural_drawing",
  mechanicalDrawing = "mechanical_drawing",
  electricalDrawing = "electrical_drawing",
  other = "other",
}

export enum EStepCodeType {
  part3StepCode = "Part3StepCode",
  part9StepCode = "Part9StepCode",
}

export enum EPermitProjectSortFields {
  title = "title",
  location = "location",
  submitter = "submitter",
  updatedAt = "updated_at",
  rollupStatus = "rollup_status",
}

export enum EPdfFormStatusFilter {
  all = "all",
  archived = "archived",
  unarchived = "unarchived",
}

export enum EPdfFormSortFields {
  projectNumber = "projectNumber",
  address = "address",
  createdAt = "createdAt",
}

export enum EPermitProjectRollupStatus {
  empty = "empty",
  newDraft = "new_draft",
  newlySubmitted = "newly_submitted",
  revisionsRequested = "revisions_requested",
  resubmitted = "resubmitted",
  approved = "approved",
}

export enum EStepCodeSortFields {
  type = "type",
  permitProjectTitle = "permit_project_title",
  fullAddress = "full_address",
  updatedAt = "updated_at",
}

export enum EClassificationCategory {
  buildingsAndStructures = "buildings_and_structures",
  trades = "trades",
  sitePreparation = "site_preparation",
}

// Centralized constants for permit classification codes (string-backed)
export const EPermitClassificationCode = {
  lowResidential: "low_residential",
  mediumResidential: "medium_residential",
  highResidential: "high_residential",
  newConstruction: "new_construction",
  additionAlterationRenovation: "addition_alteration_renovation",
  siteAlteration: "site_alteration",
  demolition: "demolition",
  manufacturedHome: "manufactured_home",
  mechanical: "mechanical",
  plumbing: "plumbing",
  electrical: "electrical",
  gas: "gas",
  solidFuelBurningAppliance: "solid_fuel_burning_appliance",
  fireAlarm: "fire_alarm",
  fireSuppression: "fire_suppression",
  treeCuttingAndTreeRemoval: "tree_cutting_and_tree_removal",
  retainingWall: "retaining_wall",
  relocation: "relocation",
} as const

export type EPermitClassificationCode = (typeof EPermitClassificationCode)[keyof typeof EPermitClassificationCode]

export enum EPreCheckServicePartner {
  archistar = "archistar",
}

export enum EPreCheckStatus {
  draft = "draft",
  processing = "processing",
  complete = "complete",
}

export enum EPreCheckAssessmentResult {
  passed = "passed",
  failed = "failed",
}

export enum EGeneralContactType {
  adjacentOwner = "adjacentOwner",
  applicant = "applicant",
  builder = "builder",
  business = "business",
  contractor = "contractor",
  designer = "designer",
  developer = "developer",
  lawyer = "lawyer",
  propertyManager = "propertyManager",
  purchaser = "purchaser",
  owner = "owner",
  tenant = "tenant",
  siteContact = "siteContact",
}

export enum EProfessionalContactType {
  architect = "architect",
  coordinatingRegisteredProfessional = "coordinatingRegisteredProfessional",
  engineer = "engineer",
  civilEngineer = "civilEngineer",
  electricalEngineer = "electricalEngineer",
  energyAdvisor = "energyAdvisor",
  fireSuppressionEngineer = "fireSuppressionEngineer",
  fireContact = "fireContact",
  geotechnicalEngineer = "geotechnicalEngineer",
  lawyer = "lawyer",
  mechanical = "mechanical",
  mechanicalEngineer = "mechanicalEngineer",
  plumbingEngineer = "plumbingEngineer",
  plumber = "plumber",
  qualifiedEnvironmentalProfessional = "qualifiedEnvironmentalProfessional",
  registeredOnsiteWastewaterPractitioner = "registeredOnsiteWastewaterPractitioner",
  structuralEngineer = "structuralEngineer",
  surveyor = "surveyor",
}

export enum EFileScanStatus {
  pending = "pending",
  clean = "clean",
  infected = "infected",
}

export enum EPdfGenerationStatus {
  notStarted = "not_started",
  queued = "queued",
  generating = "generating",
  completed = "completed",
  failed = "failed",
}
