import { t } from "i18next"
import { Instance, flow, types } from "mobx-state-tree"
import * as R from "ramda"
import { TCreatePermitApplicationFormData } from "../components/domains/permit-application/new-permit-application-screen"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { IJurisdiction } from "../models/jurisdiction"
import { IPermitApplication, PermitApplicationModel } from "../models/permit-application"
import { IUser } from "../models/user"
import { EPermitApplicationSortFields, ESocketEventTypes } from "../types/enums"
import { IUserPushPayload } from "../types/types"

export const PermitApplicationStoreModel = types
  .compose(
    types.model("PermitApplicationStore", {
      permitApplicationMap: types.map(PermitApplicationModel),
      tablePermitApplications: types.array(types.reference(PermitApplicationModel)),
      currentPermitApplication: types.maybeNull(types.reference(PermitApplicationModel)),
    }),
    createSearchModel<EPermitApplicationSortFields>("searchPermitApplications")
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
  }))
  .actions((self) => ({
    __beforeMergeUpdate(permitApplicationData) {
      const pad = permitApplicationData

      pad.stepCode && self.rootStore.stepCodeStore.mergeUpdate(pad.stepCode, "stepCodesMap")
      self.rootStore.jurisdictionStore.mergeUpdate(pad.jurisdiction, "jurisdictionMap")
      self.rootStore.userStore.mergeUpdate(pad.submitter, "usersMap")
      return R.mergeRight(pad, {
        jurisdiction: pad.jurisdiction.id,
        submitter: pad.submitter.id,
        stepCode: pad.stepCode?.id,
        isFullyLoaded: true,
      })
    },
    __beforeMergeUpdateAll(permitApplicationsData) {
      //find all unique jurisdictions
      const jurisdictionsUniq = R.uniqBy(
        (j: IJurisdiction) => j.id,
        permitApplicationsData.map((pa) => pa.jurisdiction)
      )
      self.rootStore.jurisdictionStore.mergeUpdateAll(jurisdictionsUniq, "jurisdictionMap")

      //find all unique submitters
      const submittersUniq = R.uniqBy(
        (u: IUser) => u.id,
        permitApplicationsData.map((pa) => pa.submitter)
      )
      self.rootStore.userStore.mergeUpdateAll(submittersUniq, "usersMap")

      self.rootStore.stepCodeStore.mergeUpdateAll(
        R.reject(
          R.isNil,
          permitApplicationsData.map((pa) => pa.stepCode)
        ),
        "stepCodesMap"
      )
      //return the remapped Data
      return R.map(
        (pa) =>
          R.mergeRight(pa, { jurisdiction: pa.jurisdiction.id, submitter: pa.submitter.id, stepCode: pa.stepCode?.id }),
        permitApplicationsData
      )
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

      const response = yield self.environment.api.fetchPermitApplications(
        self.rootStore?.jurisdictionStore?.currentJurisdiction?.id,
        {
          query: self.query,
          sort: self.sort,
          page: opts?.page ?? self.currentPage,
          perPage: opts?.countPerPage ?? self.countPerPage,
          statusFilter: self.statusFilter,
        }
      )

      if (response.ok) {
        response.data.data.forEach((pa) => self.addPermitApplication(pa))
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
        self.mergeUpdate(response.data, "permitApplicationMap")
        return permitApplication
      }
    }),
    setCurrentPermitApplication(permitApplicationId) {
      self.currentPermitApplication = permitApplicationId
      self.currentPermitApplication?.stepCode &&
        self.rootStore.stepCodeStore.setCurrentStepCode(self.currentPermitApplication.stepCode)
    },
    processWebsocketChange: flow(function* (payload: IUserPushPayload) {
      //based on the eventType do stuff
      switch (payload.eventType) {
        case ESocketEventTypes.update:
          const event = new CustomEvent("handlePermitApplicationUpdate", { detail: payload.data })
          document.dispatchEvent(event)
          break
        default:
          import.meta.env.DEV && console.log(`Unknown event type ${payload.eventType}`)
      }
    }),
  }))

export interface IPermitApplicationStore extends Instance<typeof PermitApplicationStoreModel> {}
