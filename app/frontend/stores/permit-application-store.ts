import { Instance, flow, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { IPermitApplication, PermitApplicationModel } from "../models/permit-application"

export const PermitApplicationStoreModel = types
  .model("PermitApplicationStore", {
    permitApplicationMap: types.map(PermitApplicationModel),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
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
    // Action to add a new PermitApplication
    addPermitApplication(permitapplication: IPermitApplication) {
      self.permitApplicationMap.put(permitapplication)
    },
    // Action to remove a PermitApplication
    removePermitApplication(id: string) {
      self.permitApplicationMap.delete(id)
    },
    // Example of an asynchronous action to fetch permitapplications from an API
    fetchPermitApplications: flow(function* () {
      const response: any = yield self.environment.api.fetchPermitApplications()
      if (response.ok) {
        console.log(response)
        //find all unique jurisdictions
        const jurisdictionsUniq = R.uniqBy(
          (j) => j.id,
          response.data.data.map((pa) => pa.jurisdiction)
        )
        jurisdictionsUniq.forEach((j) => self.rootStore.jurisdictionStore.addJurisdiction(j))
        //find all unique submitters
        const submittersUniq = R.uniqBy(
          (u) => u.id,
          response.data.data.map((pa) => pa.submitter)
        )
        self.rootStore.userStore.setUsers(submittersUniq)

        R.map((c) => {
          self.permitApplicationMap.put(
            R.mergeRight(c, { jurisdiction: c["jurisdiction"]["id"], submitter: c["submitter"]["id"] })
          )
        }, response.data.data)
        //TODO: add pagination
        return true
      }
    }),
  }))

export interface IPermitApplicationStore extends Instance<typeof PermitApplicationStoreModel> {}
