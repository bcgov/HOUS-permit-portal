import { flow, Instance, types } from "mobx-state-tree"
import * as R from "ramda"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { CollaboratorModel, ICollaborator } from "../models/collaborator"
import { IJurisdiction } from "../models/jurisdiction"
import { IUser } from "../models/user"
import { ECollaborationType, ECollaboratorableType } from "../types/enums"
import { TSearchParams } from "../types/types"

export const CollaboratorStoreModel = types
  .compose(
    types.model("CollaboratorStore", {
      collaboratorMap: types.map(CollaboratorModel),
      collaboratorSearchList: types.array(types.reference(CollaboratorModel)),
      searchContext: types.maybeNull(types.enumeration(Object.values(ECollaborationType))),
    }),
    createSearchModel<never>("searchCollaborators", undefined, true)
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
        collaboratorData.collaboratorableType === ECollaboratorableType.User &&
          self.rootStore.userStore.mergeUpdate(collaboratorData.collaboratorable, "usersMap")
        collaboratorData.collaboratorableType === ECollaboratorableType.Jurisdiction &&
          self.rootStore.jurisdictionStore.mergeUpdate(collaboratorData.collaboratorable, "jurisdictionMap")

        collaboratorData.user && self.rootStore.userStore.mergeUpdate(collaboratorData.user, "usersMap")
      }

      return collaboratorData
    },
    __beforeMergeUpdateAll(collaboratorsData) {
      //find all unique jurisdictions
      const jurisdictionsUniq = R.uniqBy(
        (j: IJurisdiction) => j.id,
        collaboratorsData
          .filter((c) => c.collaboratorableType === ECollaboratorableType.Jurisdiction)
          .map((c) => c.collaboratorable)
      )
      self.rootStore.jurisdictionStore.mergeUpdateAll(jurisdictionsUniq, "jurisdictionMap")

      //find all unique submitters
      const users = R.uniqBy(
        (u: IUser) => u.id,
        collaboratorsData
          .filter((c) => c.collaboratorableType === ECollaboratorableType.User)
          .map((c) => c.collaboratorable)
          .concat(collaboratorsData.map((c) => c.user))
      )

      self.rootStore.userStore.mergeUpdateAll(users, "usersMap")

      // Already merged associations here.
      // Since beforeMergeUpdateAll internally uses beforeMergeUpdate, we need to skip the association merges
      // to reduce duplication of work

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
    setSearchContext(context: ECollaborationType | null) {
      self.searchContext = context
    },
  }))
  .actions((self) => ({
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

      const response = yield self.environment.api.fetchCollaboratorsByCollaboratorable(
        self.searchContext === ECollaborationType.review ? currentUser.jurisdiction?.id : currentUser.id,
        searchParams
      )

      if (response.ok) {
        self.mergeUpdateAll(response.data.data, "collaboratorMap")
        self.setCollaboratorSearchList(response.data.data)

        self.currentPage = opts?.page ?? self.currentPage
        self.totalPages = response.data.meta.totalPages
        self.totalCount = response.data.meta.totalCount
        self.countPerPage = opts?.countPerPage ?? self.countPerPage
      }
      return response.ok
    }),
  }))

export interface ICollaboratorStore extends Instance<typeof CollaboratorStoreModel> {}
