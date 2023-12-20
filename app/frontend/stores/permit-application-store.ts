import { Instance, flow, types } from "mobx-state-tree"
import { IPermitApplication, PermitApplicationModel } from "../models/permit-application"
import { EPermitApplicationStatus, EPermitType } from "../types/enums"

export const PermitApplicationStoreModel = types
  .model("PermitApplicationStore", {
    permitApplicationMap: types.map(PermitApplicationModel),
  })
  .views((self) => ({
    // View to get a PermitApplication by id
    getPermitApplicationById(id: string) {
      return self.permitApplicationMap.get(id)
    },

    // View to get all permitapplications as an array
    get permitApplications() {
      // TODO: UNSTUB APPLICATIONS
      // return Array.from(self.permitApplicationMap.values())

      return [
        {
          id: "27a32891-7e34-480c-830d-ce595c2fe74c",
          nickname: "Cool Draft Permit 1",
          jurisdictionName: "North Cowichan",
          number: "9999",
          permitType: EPermitType.residential,
          status: EPermitApplicationStatus.draft,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "27a32891-7e34-480c-830d-ce595c2fe73c",
          nickname: "Cool Draft Permit 2",
          jurisdictionName: "North Cowichan",
          number: "8888",
          permitType: "residential",
          status: "draft",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "27a32891-7e34-480c-130d-ce595c2fe74c",
          nickname: "Cool Draft Permit 3",
          jurisdictionName: "North Cowichan",
          number: "7777",
          permitType: "residential",
          status: "draft",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
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
      // try {
      //   const response = yield fetch("/api/permitapplications");
      //   const permitapplications = yield response.json();
      //   applySnapshot(self.permitapplications, permitapplications);
      // } catch (error) {
      //   console.error("Failed to fetch permitapplications", error);
      // }
    }),
  }))

export interface IPermitApplicationStore extends Instance<typeof PermitApplicationStoreModel> {}
