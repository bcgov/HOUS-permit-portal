import { t } from "i18next"
import { flow, Instance, toGenerator, types } from "mobx-state-tree"
import * as R from "ramda"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { ICollaborator } from "../models/collaborator"
import { IJurisdiction } from "../models/jurisdiction"
import { IPermitApplication, PermitApplicationModel } from "../models/permit-application"
import { IPermitBlockStatus } from "../models/permit-block-status"
import { IRequirementTemplate } from "../models/requirement-template"
import { IUser } from "../models/user"
import {
  ECustomEvents,
  EPermitApplicationSocketEventTypes,
  EPermitApplicationSortFields,
  EPermitApplicationStatus,
  EPermitApplicationStatusGroup,
  EProjectPermitApplicationSortFields,
} from "../types/enums"
import {
  IPermitApplicationComplianceUpdate,
  IPermitApplicationSearchFilters,
  IPermitApplicationSupportingDocumentsUpdate,
  IUserPushPayload,
  TCreatePermitApplicationFormData,
  TSearchParams,
} from "../types/types"
import { convertResourceArrayToRecord, setQueryParam, startBlobDownload } from "../utils/utility-functions"

const filterableStatus = Object.values(EPermitApplicationStatus)
export type TFilterableStatus = (typeof filterableStatus)[number]

export const PermitApplicationStoreModel = types
  .compose(
    types.model("PermitApplicationStore", {
      permitApplicationMap: types.map(PermitApplicationModel),
      tablePermitApplications: types.array(types.reference(PermitApplicationModel)),
      currentPermitApplication: types.maybeNull(types.reference(PermitApplicationModel)),
      statusFilter: types.optional(types.array(types.enumeration(filterableStatus)), []),
      templateVersionIdFilter: types.maybeNull(types.string),
      requirementTemplateIdFilter: types.optional(types.array(types.string), []),
      hasCollaboratorFilter: types.maybeNull(types.boolean),
      submissionDelagateeIdFilter: types.optional(types.array(types.string), []),
    }),
    createSearchModel<EProjectPermitApplicationSortFields | EPermitApplicationSortFields>(
      "searchPermitApplications",
      "setPermitApplicationFilters"
    )
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    get draftStatuses() {
      return [EPermitApplicationStatus.newDraft, EPermitApplicationStatus.revisionsRequested]
    },
    get submittedStatuses() {
      return [EPermitApplicationStatus.newlySubmitted, EPermitApplicationStatus.resubmitted]
    },
  }))
  .views((self) => ({
    getProjectPermitApplicationSortColumnHeader(field: EProjectPermitApplicationSortFields) {
      const map = {
        [EProjectPermitApplicationSortFields.permit]: t("permitProject.overview.permit"),
        [EProjectPermitApplicationSortFields.assignedTo]: t("permitProject.overview.assignedTo"),
        [EProjectPermitApplicationSortFields.permitApplicationNumber]: t(
          "permitProject.overview.permitApplicationNumber"
        ),
        [EProjectPermitApplicationSortFields.updatedAt]: t("permitProject.overview.updatedAt"),
        [EProjectPermitApplicationSortFields.status]: t("permitProject.overview.status"),
      }
      return map[field]
    },

    getPermitApplicationSortColumnHeader(field: EPermitApplicationSortFields) {
      // @ts-ignore
      return t(`permitApplication.columns.${field}`)
    },
    // View to get a PermitApplication by id
    getPermitApplicationById(id: string) {
      return self.permitApplicationMap.get(id)
    },
    // View to get all permitapplications as an array
    get permitApplications() {
      return Array.from(self.permitApplicationMap.values())
    },
    get hasResetableFilters() {
      return self.hasCollaboratorFilter || self.templateVersionIdFilter || !R.isEmpty(self.requirementTemplateIdFilter)
    },
    get statusFilterToGroup(): EPermitApplicationStatusGroup {
      const map = {
        [self.draftStatuses.join(",")]: EPermitApplicationStatusGroup.draft,
        [self.submittedStatuses.join(",")]: EPermitApplicationStatusGroup.submitted,
      }
      return map[self.statusFilter.join(",")]
    },
  }))
  .actions((self) => ({
    setCurrentPermitApplication(permitApplicationId) {
      self.currentPermitApplication = permitApplicationId
      self.currentPermitApplication?.stepCode &&
        self.rootStore.stepCodeStore.setCurrentStepCode(self.currentPermitApplication.stepCode.id)
    },
    setHasCollaboratorFilter(value: boolean) {
      setQueryParam("hasCollaborator", value.toString())
      self.hasCollaboratorFilter = value
    },
    resetCurrentPermitApplication() {
      self.currentPermitApplication = null
      self.rootStore.stepCodeStore.setCurrentStepCode(null)
    },
    __beforeMergeUpdate(permitApplicationData) {
      const pad = permitApplicationData

      if (!pad.skipAssociationMerges) {
        pad.sandbox && self.rootStore.sandboxStore.mergeUpdate(pad.sandbox, "sandboxMap")
        pad.stepCode && self.rootStore.stepCodeStore.mergeUpdate(pad.stepCode, "stepCodesMap")
        pad.jurisdiction && self.rootStore.jurisdictionStore.mergeUpdate(pad.jurisdiction, "jurisdictionMap")
        pad.submitter && self.rootStore.userStore.mergeUpdate(pad.submitter, "usersMap")
        pad.templateVersion &&
          self.rootStore.templateVersionStore.mergeUpdate(pad.templateVersion, "templateVersionMap")
        pad.publishedTemplateVersion &&
          self.rootStore.templateVersionStore.mergeUpdate(pad.publishedTemplateVersion, "templateVersionMap")
        pad.permitCollaborations &&
          self.rootStore.collaboratorStore.mergeUpdateAll(
            // @ts-ignore
            R.map(R.prop("collaborator"), pad.permitCollaborations),
            "collaboratorMap"
          )
      }

      return R.mergeRight(pad, {
        sandbox: pad.sandbox?.id,
        jurisdiction: pad.jurisdiction?.id,
        submitter: pad.submitter?.id,
        templateVersion: pad.templateVersion?.id,
        publishedTemplateVersion: pad.publishedTemplateVersion?.id,
        stepCode: pad.stepCode?.id,
      })
    },
    __beforeMergeUpdateAll(permitApplicationsData) {
      //find all unique jurisdictions
      const jurisdictionsUniq = R.uniqBy(
        (j: IJurisdiction) => j.id,
        permitApplicationsData.filter((pa) => pa.jurisdiction).map((pa) => pa.jurisdiction)
      )
      // @ts-ignore
      self.rootStore.jurisdictionStore.mergeUpdateAll(jurisdictionsUniq, "jurisdictionMap")

      //find all unique submitters
      const submittersUniq = R.uniqBy(
        (u: IUser) => u.id,
        permitApplicationsData.filter((pa) => pa.submitter).map((pa) => pa.submitter)
      )
      // @ts-ignore
      self.rootStore.userStore.mergeUpdateAll(submittersUniq, "usersMap")

      self.rootStore.templateVersionStore.mergeUpdateAll(
        R.reject(
          R.isNil,
          permitApplicationsData.map((pa) => pa.templateVersion)
        ),
        "templateVersionMap"
      )

      self.rootStore.templateVersionStore.mergeUpdateAll(
        R.reject(
          R.isNil,
          permitApplicationsData.map((pa) => pa.publishedTemplateVersion)
        ),
        "templateVersionMap"
      )

      self.rootStore.stepCodeStore.mergeUpdateAll(
        R.reject(
          R.isNil,
          permitApplicationsData.map((pa) => pa.stepCode)
        ),
        "stepCodesMap"
      )

      self.rootStore.collaboratorStore.mergeUpdateAll(
        R.pipe(
          R.map(R.prop("permitCollaborations")),
          R.reject(R.isNil),
          R.flatten,
          R.map(R.prop("collaborator")),
          R.uniqBy((c: ICollaborator) => c.id)
        )(permitApplicationsData),
        "collaboratorMap"
      )

      // Already merged associations here.
      // Since beforeMergeUpdateAll internally uses beforeMergeUpdate, we need to skip the association merges
      // to reduce duplication of work

      permitApplicationsData.skipAssociationMerges = true

      return permitApplicationsData
    },
  }))
  .actions((self) => ({
    setTablePermitApplications: (permitApplications) => {
      self.tablePermitApplications = permitApplications.map((pa) => pa.id)
    },
    // Action to add a new PermitApplication
    addPermitApplication(permitapplication: IPermitApplication) {
      self.permitApplicationMap.put(permitapplication)
    },
    setStatusFilter(statuses: TFilterableStatus[] | undefined) {
      if (!statuses) return

      setQueryParam("status", statuses)

      if (statuses.some((status) => !filterableStatus.includes(status))) return
      // @ts-ignore
      self.statusFilter = statuses
    },
    setRequirementTemplateIdFilter(requirementTemplateIds: string[] | undefined) {
      if (!requirementTemplateIds) return
      setQueryParam("requirementTemplateId", requirementTemplateIds)
      // @ts-ignore
      self.requirementTemplateIdFilter = requirementTemplateIds
    },
    setSubmissionCollaboratorIdFilter(submissionDelegateeId: string[] | undefined) {
      if (!submissionDelegateeId) return
      setQueryParam("submissionDelagateeId", submissionDelegateeId)
      // @ts-ignore
      self.submissionDelagateeIdFilter = submissionDelegateeId
    },
    searchPermitApplications: flow(function* (opts?: { reset?: boolean; page?: number; countPerPage?: number }) {
      if (opts?.reset) {
        self.resetPages()
      }
      const requirementTemplateId =
        self.requirementTemplateIdFilter.length > 0 ? self.requirementTemplateIdFilter.join(",") : null
      const searchParams = {
        query: self.query,
        sort: self.sort,
        page: opts?.page ?? self.currentPage,
        perPage: opts?.countPerPage ?? self.countPerPage,
        showArchived: self.showArchived,
        filters: {
          status: self.statusFilter,
          templateVersionId: self.templateVersionIdFilter,
          requirementTemplateId,
          hasCollaborator: self.hasCollaboratorFilter,
          submissionDelegateeId: self.submissionDelagateeIdFilter,
        },
      } as TSearchParams<EPermitApplicationSortFields, IPermitApplicationSearchFilters>

      const currentJurisdictionId = self.rootStore?.jurisdictionStore?.currentJurisdiction?.id
      const currentPermitProjectId = self.rootStore?.permitProjectStore?.currentPermitProject?.id

      const response = currentJurisdictionId
        ? yield self.environment.api.fetchJurisdictionPermitApplications(currentJurisdictionId, searchParams)
        : currentPermitProjectId
          ? yield self.environment.api.fetchProjectPermitApplications(currentPermitProjectId, searchParams)
          : yield self.environment.api.fetchPermitApplications(searchParams)

      if (response.ok) {
        self.mergeUpdateAll(response.data.data, "permitApplicationMap")
        const permitProject = self.rootStore.permitProjectStore.currentPermitProject
        if (permitProject) {
          permitProject.setTablePermitApplications(response.data.data)
        } else {
          ;(self?.rootStore?.jurisdictionStore?.currentJurisdiction ?? self).setTablePermitApplications(
            response.data.data
          )
        }

        self.setPageFields(response.data.meta, opts)
      }
      return response.ok
    }),
  }))
  .actions((self) => ({
    getEphemeralPermitApplication(
      requirementTemplate: IRequirementTemplate,
      overrides: Partial<IPermitApplication> = {}
    ) {
      const permitApplication = PermitApplicationModel.create({
        id: `ephemeral-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        nickname: overrides.nickname || "Ephemeral Application",
        number: overrides.number || "",
        fullAddress: overrides.fullAddress || null,
        pin: overrides.pin || null,
        pid: overrides.pid || null,
        permitType: requirementTemplate.permitType || overrides.permitType || {}, // Provide default or empty objects as needed
        activity: requirementTemplate.activity || overrides.activity || {},
        status: overrides.status || EPermitApplicationStatus.ephemeral,
        submitter: overrides.submitter || self.rootStore.userStore.currentUser?.id || null,
        jurisdiction: overrides.jurisdiction || null,
        templateVersion: requirementTemplate.publishedTemplateVersion || overrides.templateVersion || null,
        publishedTemplateVersion:
          requirementTemplate.publishedTemplateVersion || overrides.publishedTemplateVersion || null,
        formJson: overrides.formJson || requirementTemplate.publishedTemplateVersion.formJson,
        submissionData: overrides.submissionData || null,
        formattedComplianceData: overrides.formattedComplianceData || null,
        formCustomizations: {},
        // todo: consider formCustomizations?
        // formCustomizations: overrides.formCustomizations || null,
        submittedAt: overrides.submittedAt || null,
        resubmittedAt: overrides.resubmittedAt || null,
        revisionsRequestedAt: overrides.revisionsRequestedAt || null,
        selectedTabIndex: overrides.selectedTabIndex ?? 0,
        createdAt: overrides.createdAt || new Date(),
        updatedAt: overrides.updatedAt || new Date(),
        stepCode: overrides.stepCode || null,
        supportingDocuments: overrides.supportingDocuments || null,
        allSubmissionVersionCompletedSupportingDocuments:
          overrides.allSubmissionVersionCompletedSupportingDocuments || null,
        zipfileSize: overrides.zipfileSize || null,
        zipfileName: overrides.zipfileName || null,
        zipfileUrl: overrides.zipfileUrl || null,
        referenceNumber: overrides.referenceNumber || null,
        missingPdfs: overrides.missingPdfs || null,
        isFullyLoaded: overrides.isFullyLoaded ?? false,
        isDirty: overrides.isDirty ?? false,
        isLoading: overrides.isLoading ?? false,
        usingCurrentTemplateVersion: overrides.usingCurrentTemplateVersion || null,
        showingCompareAfter: overrides.showingCompareAfter ?? false,
        revisionMode: overrides.revisionMode ?? false,
        diff: overrides.diff || null,
        submissionVersions: overrides.submissionVersions || [],
        selectedSubmissionVersion: overrides.selectedSubmissionVersion || null,
        permitCollaborationMap: overrides.permitCollaborationMap || {},
        permitBlockStatusMap: overrides.permitBlockStatusMap || {},
        isViewingPastRequests: overrides.isViewingPastRequests ?? false,
        // Initialize maps properly if overrides provide arrays
        ...((overrides as any).permitCollaborations && {
          permitCollaborationMap: convertResourceArrayToRecord((overrides as any).permitCollaborations),
        }),
        ...((overrides as any).permitBlockStatuses && {
          permitBlockStatusMap: convertResourceArrayToRecord((overrides as any).permitBlockStatuses),
        }),
      })

      self.addPermitApplication(permitApplication)
      self.setCurrentPermitApplication(permitApplication.id)

      return self.currentPermitApplication
    },
  }))
  .actions((self) => ({
    createPermitApplication: flow(function* (formData: TCreatePermitApplicationFormData) {
      const { ok, data: response } = yield self.environment.api.createPermitApplication(formData)
      if (ok && response.data) {
        self.mergeUpdate(response.data, "permitApplicationMap")
        return response.data
      }
      return false
    }),
    // Action to remove a PermitApplication
    removePermitApplication(id: string) {
      self.permitApplicationMap.delete(id)
    },
    downloadApplicationMetrics: flow(function* () {
      try {
        const response = yield* toGenerator(self.environment.api.downloadApplicationMetricsCsv())
        if (!response.ok) {
          return response.ok
        }

        const blobData = response.data
        const fileName = `${t("reporting.applicationMetrics.filename")}.csv`
        const mimeType = "text/csv"
        startBlobDownload(blobData, mimeType, fileName)

        return response
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error(`Failed to download permit application metrics:`, error)
        }
        throw error
      }
    }),
    fetchPermitApplication: flow(function* (id: string, review?: boolean) {
      // If the user is review staff, we still need to hit the show endpoint to update viewedAt
      const { ok, data: response } = yield self.environment.api.fetchPermitApplication(id, review)
      if (ok && response.data) {
        const permitApplication = response.data

        permitApplication.isFullyLoaded = true

        self.mergeUpdate(permitApplication, "permitApplicationMap")
        return permitApplication
      }
    }),

    setPermitApplicationFilters(queryParams: URLSearchParams) {
      const statusFilter = queryParams.get("status")?.split(",") as TFilterableStatus[]
      const templateVersionIdFilter = queryParams.get("templateVersionId")
      const requirementTemplateIdFilter = queryParams.get("requirementTemplateId")?.split(",")
      const hasCollaboratorFilter = queryParams.get("hasCollaborator") === "true"
      const submissionDelagateeIdFilter = queryParams.get("submissionDelagateeId")?.split(",")

      self.setStatusFilter(statusFilter)
      self.setRequirementTemplateIdFilter(requirementTemplateIdFilter)
      self.setSubmissionCollaboratorIdFilter(submissionDelagateeIdFilter)
      self.templateVersionIdFilter = templateVersionIdFilter
      self.hasCollaboratorFilter = hasCollaboratorFilter
    },

    processWebsocketChange: flow(function* (payload: IUserPushPayload) {
      //based on the eventType do stuff
      let payloadData
      switch (payload.eventType as EPermitApplicationSocketEventTypes) {
        case EPermitApplicationSocketEventTypes.updateCompliance:
          payloadData = payload.data as IPermitApplicationComplianceUpdate
          const event = new CustomEvent(ECustomEvents.handlePermitApplicationUpdate, { detail: payloadData })

          self.permitApplicationMap
            .get(payloadData?.id)
            ?.setFormattedComplianceData(payloadData?.formattedComplianceData)
          document.dispatchEvent(event)
          break
        case EPermitApplicationSocketEventTypes.updateSupportingDocuments:
          payloadData = payload.data as IPermitApplicationSupportingDocumentsUpdate

          self.permitApplicationMap.get(payloadData?.id)?.handleSocketSupportingDocsUpdate(payloadData)
          break
        case EPermitApplicationSocketEventTypes.updatePermitBlockStatus:
          payloadData = payload.data as IPermitBlockStatus
          self.permitApplicationMap.get(payloadData?.permitApplicationId)?.updatePermitBlockStatus(payloadData)
          break
        default:
          import.meta.env.DEV && console.log(`Unknown event type ${payload.eventType}`)
      }
    }),
  }))
  .actions((self) => ({
    resetFilters() {
      self.statusFilter = [] as any
      self.hasCollaboratorFilter = null
      self.templateVersionIdFilter = null
      self.requirementTemplateIdFilter = [] as any
      self.submissionDelagateeIdFilter = [] as any
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href)
        const staticParams = ["templateVersionId", "requirementTemplateId", "hasCollaborator", "submissionDelagateeId"]
        staticParams.forEach((param) => {
          url.searchParams.delete(param)
        })
        window.history.replaceState(null, "", url.toString())
      }
      self.searchPermitApplications()
    },
  }))

export interface IPermitApplicationStore extends Instance<typeof PermitApplicationStoreModel> {}
