import { Instance, flow, types } from "mobx-state-tree"
import PermitApplication, { IPermitApplicationModel } from "../models/permit-application"

const PermitApplicationStore = types
  .model("PermitApplicationStore", {
    permitApplicationsMap: types.map(PermitApplication),
  })
  .views((self) => ({
    // View to get a PermitApplication by id
    getPermitApplicationById(id: string) {
      return self.permitApplicationsMap.get(id)
    },

    // View to get all permitapplications as an array
    get permitApplications() {
      return Array.from(self.permitApplicationsMap.values())
    },
  }))
  .actions((self) => ({
    // Action to add a new PermitApplication
    addPermitApplication(permitapplication: IPermitApplicationModel) {
      self.permitApplicationsMap.put(permitapplication)
    },
    // Action to remove a PermitApplication
    removePermitApplication(id: string) {
      self.permitApplicationsMap.delete(id)
    },
    // Example of an asynchronous action to fetch permitapplications from an API
    fetchPermitApplications: flow(function* () {
      // try {
      //   const response = yield fetch("/api/permitapplications");
      //   const permitapplications = yield response.json();
      //   applySnapshot(self.permitapplications, permitapplications);
      // } catch (error) {
      //   console.error("Failed to fetch permitapplications", error);
      // }
    }),
  }))

export interface IPermitApplicationStore extends Instance<typeof PermitApplicationStore> {}

export default PermitApplication
