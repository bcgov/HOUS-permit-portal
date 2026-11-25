import { flow, Instance, types } from "mobx-state-tree"
import * as R from "ramda"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { CollaboratorModel, ICollaborator } from "../models/collaborator"
import { IOption, TSearchParams } from "../types/types"

export const CollaboratorStoreModel = types
  .compose(
    types.model("CollaboratorStore", {
      collaboratorMap: types.map(CollaboratorModel),
      collaboratorSearchList: types.array(types.reference(CollaboratorModel)),
    }),
    createSearchModel<never>("searchCollaborators", undefined)
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    getCollaboratorById(id: string) {
      return self.collaboratorMap.get(id)
    },
    getFilteredCollaborationSearchList(takenCollaboratorIds: Set<string>) {
      return self.collaboratorSearchList.filter((c) => !takenCollaboratorIds.has(c.id))
    },
  }))
  .actions((self) => ({
    __beforeMergeUpdate(collaboratorData) {
      if (!collaboratorData.skipAssociationMerges) {
        collaboratorData.user && self.rootStore.userStore.mergeUpdate(collaboratorData.user, "usersMap")
      }

      return collaboratorData
    },
    __beforeMergeUpdateAll(collaboratorsData) {
      const users = R.uniqBy((u: { id: string }) => u.id, collaboratorsData.map((c) => c.user).filter(Boolean))

      self.rootStore.userStore.mergeUpdateAll(users, "usersMap")

      collaboratorsData.skipAssociationMerges = true

      return collaboratorsData
    },
  }))
  .actions((self) => ({
    setCollaboratorSearchList: (collaborators) => {
      self.collaboratorSearchList = collaborators.map((c) => c.id)
    },
    addCollaborator(collaborator: ICollaborator) {
      self.collaboratorMap.put(collaborator)
    },
  }))
  .actions((self) => ({
    fetchCollaboratorOptionsForJurisdiction: flow(function* (jurisdictionId: string): Generator<any, IOption[], any> {
      const response = yield self.environment.api.fetchCollaboratorsByJurisdiction(jurisdictionId)
      if (response.ok && response.data?.data) {
        return response.data.data.map((collab: any) => ({
          value: collab.user.id,
          label: `${collab.user.firstName} ${collab.user.lastName}`,
        }))
      }
      return []
    }),
    searchCollaborators: flow(function* (opts?: { reset?: boolean; page?: number; countPerPage?: number }) {
      let currentUser = self.rootStore.userStore?.currentUser

      if (!currentUser) {
        return
      }
      if (opts?.reset) {
        self.resetPages()
      }

      const searchParams = {
        query: self.query,
        sort: self.sort,
        page: opts?.page ?? self.currentPage,
        perPage: opts?.countPerPage ?? self.countPerPage,
      } as TSearchParams<never, never>

      const response = yield self.environment.api.fetchCollaboratorsByJurisdiction(
        currentUser.jurisdiction?.id,
        searchParams
      )

      if (response.ok) {
        self.mergeUpdateAll(response.data.data, "collaboratorMap")
        self.setCollaboratorSearchList(response.data.data)

        self.setPageFields(response.data.meta, opts)
      }
      return response.ok
    }),
  }))

export interface ICollaboratorStore extends Instance<typeof CollaboratorStoreModel> {}
