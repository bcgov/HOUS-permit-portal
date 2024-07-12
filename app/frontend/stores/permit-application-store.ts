import { t } from "i18next"
import { flow, Instance, types } from "mobx-state-tree"
import * as R from "ramda"
import { TCreatePermitApplicationFormData } from "../components/domains/permit-application/new-permit-application-screen"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { IJurisdiction } from "../models/jurisdiction"
import { IPermitApplication, PermitApplicationModel } from "../models/permit-application"
import { IUser } from "../models/user"
import {
  ECustomEvents,
  EPermitApplicationSocketEventTypes,
  EPermitApplicationSortFields,
  EPermitApplicationStatusGroups,
} from "../types/enums"
import {
  IPermitApplicationComplianceUpdate,
  IPermitApplicationSearchFilters,
  IPermitApplicationSupportingDocumentsUpdate,
  IUserPushPayload,
  TSearchParams,
} from "../types/types"
import { setQueryParam } from "../utils/utility-functions"

const filterableStatusGroups = Object.values(EPermitApplicationStatusGroups)
export type TFilterableStatus = (typeof filterableStatusGroups)[number]

export const PermitApplicationStoreModel = types
  .compose(
    types.model("PermitApplicationStore", {
      permitApplicationMap: types.map(PermitApplicationModel),
      tablePermitApplications: types.array(types.reference(PermitApplicationModel)),
      currentPermitApplication: types.maybeNull(types.reference(PermitApplicationModel)),
      statusGroupFilter: types.optional(
        types.enumeration(filterableStatusGroups),
        EPermitApplicationStatusGroups.draft
      ),
      templateVersionIdFilter: types.maybeNull(types.string),
      requirementTemplateIdFilter: types.maybeNull(types.string),
    }),
    createSearchModel<EPermitApplicationSortFields>("searchPermitApplications", "setPermitApplicationFilters")
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    getSortColumnHeader(field: EPermitApplicationSortFields) {
      // @ts-ignore
      return t(`permitApplication.columns.${field}`)
    },
    // View to get a PermitApplication by id
    getPermitApplicationById(id: string) {
      return self.permitApplicationMap.get(id)
    },
    // View to get all permitapplications as an array
    get permitApplications() {
      // TODO: UNSTUB APPLICATIONS
      return Array.from(self.permitApplicationMap.values())
    },
    get hasResetableFilters() {
      return !R.isNil(self.templateVersionIdFilter) || !R.isNil(self.requirementTemplateIdFilter)
    },
  }))
  .actions((self) => ({
    __beforeMergeUpdate(permitApplicationData) {
      const pad = permitApplicationData

      if (!pad.skipAssociationMerges) {
        pad.stepCode && self.rootStore.stepCodeStore.mergeUpdate(pad.stepCode, "stepCodesMap")
        pad.jurisdiction && self.rootStore.jurisdictionStore.mergeUpdate(pad.jurisdiction, "jurisdictionMap")
        pad.submitter && self.rootStore.userStore.mergeUpdate(pad.submitter, "usersMap")
        pad.templateVersion &&
          self.rootStore.templateVersionStore.mergeUpdate(pad.templateVersion, "templateVersionMap")
        pad.publishedTemplateVersion &&
          self.rootStore.templateVersionStore.mergeUpdate(pad.publishedTemplateVersion, "templateVersionMap")
      }

      return R.mergeRight(pad, {
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
      self.rootStore.jurisdictionStore.mergeUpdateAll(jurisdictionsUniq, "jurisdictionMap")

      //find all unique submitters
      const submittersUniq = R.uniqBy(
        (u: IUser) => u.id,
        permitApplicationsData.filter((pa) => pa.submitter).map((pa) => pa.submitter)
      )
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
    setStatusGroupFilter(status: TFilterableStatus) {
      if (!status) return

      setQueryParam("statusGroup", status)
      self.statusGroupFilter = status
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
    searchPermitApplications: flow(function* (opts?: { reset?: boolean; page?: number; countPerPage?: number }) {
      if (opts?.reset) {
        self.resetPages()
      }

      const searchParams = {
        query: self.query,
        sort: self.sort,
        page: opts?.page ?? self.currentPage,
        perPage: opts?.countPerPage ?? self.countPerPage,
        filters: {
          statusGroup: self.statusFilterGroup,
          templateVersionId: self.templateVersionIdFilter,
          requirementTemplateId: self.requirementTemplateIdFilter,
        },
      } as TSearchParams<EPermitApplicationSortFields, IPermitApplicationSearchFilters>

      const currentJurisdictionId = self.rootStore?.jurisdictionStore?.currentJurisdiction?.id

      const response = currentJurisdictionId
        ? yield self.environment.api.fetchJurisdictionPermitApplications(currentJurisdictionId, searchParams)
        : yield self.environment.api.fetchPermitApplications(searchParams)

      if (response.ok) {
        self.mergeUpdateAll(response.data.data, "permitApplicationMap")
        ;(self?.rootStore?.jurisdictionStore?.currentJurisdiction ?? self).setTablePermitApplications(
          response.data.data
        )

        self.currentPage = opts?.page ?? self.currentPage
        self.totalPages = response.data.meta.totalPages
        self.totalCount = response.data.meta.totalCount
        self.countPerPage = opts?.countPerPage ?? self.countPerPage
      }
      return response.ok
    }),
    fetchPermitApplication: flow(function* (id: string) {
      // If the user is review staff, we still need to hit the show endpoint to update viewedAt
      const { ok, data: response } = yield self.environment.api.fetchPermitApplication(id)
      if (ok && response.data) {
        const permitApplication = response.data

        permitApplication.isFullyLoaded = true

        self.mergeUpdate(permitApplication, "permitApplicationMap")
        return permitApplication
      }
    }),

    setPermitApplicationFilters(queryParams: URLSearchParams) {
      const statusGroupFilter = queryParams.get("statusGroup") as TFilterableStatus
      const templateVersionIdFilter = queryParams.get("templateVersionId")
      const requirementTemplateIdFilter = queryParams.get("requirementTemplateId")

      self.setStatusGroupFilter(statusGroupFilter)
      self.requirementTemplateIdFilter = requirementTemplateIdFilter
      self.templateVersionIdFilter = templateVersionIdFilter
    },

    setCurrentPermitApplication(permitApplicationId) {
      self.currentPermitApplication = permitApplicationId
      self.currentPermitApplication &&
        self.rootStore.stepCodeStore.setCurrentStepCode(self.currentPermitApplication.stepCode)
    },
    resetCurrentPermitApplication() {
      self.currentPermitApplication = null
      self.rootStore.stepCodeStore.setCurrentStepCode(null)
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
        default:
          import.meta.env.DEV && console.log(`Unknown event type ${payload.eventType}`)
      }
    }),
  }))

export interface IPermitApplicationStore extends Instance<typeof PermitApplicationStoreModel> {}
