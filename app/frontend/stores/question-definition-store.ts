import { Instance, cast, flow, toGenerator, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { IQuestionDefinition, QuestionDefinitionModel } from "../models/question-definition"

export const QuestionDefinitionStoreModel = types
  .model("QuestionDefinitionStoreModel")
  .props({
    questionDefinitionMap: types.map(QuestionDefinitionModel),
    tableQuestionDefinitionIds: types.array(types.string),
    query: types.maybeNull(types.string),
    currentPage: types.optional(types.number, 1),
    totalPages: types.optional(types.number, 1),
    totalCount: types.optional(types.number, 0),
    countPerPage: types.optional(types.number, 50),
    isLoading: types.optional(types.boolean, false),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    getQuestionDefinitionById(id: string): IQuestionDefinition | undefined {
      return self.questionDefinitionMap.get(id)
    },
    get tableQuestionDefinitions(): IQuestionDefinition[] {
      return self.tableQuestionDefinitionIds
        .map((id) => self.questionDefinitionMap.get(id))
        .filter((qd): qd is IQuestionDefinition => !!qd)
    },
  }))
  .actions((self) => ({
    setQuery(query: string) {
      self.query = query
    },
    upsertQuestionDefinition(snapshot: any) {
      self.questionDefinitionMap.put(snapshot)
    },
  }))
  .actions((self) => ({
    fetchQuestionDefinitions: flow(function* (opts?: { query?: string; page?: number; reviewState?: string }) {
      self.isLoading = true
      const response = yield* toGenerator(
        self.environment.api.fetchQuestionDefinitions({
          query: opts?.query ?? self.query ?? undefined,
          page: opts?.page ?? self.currentPage,
          perPage: self.countPerPage,
          reviewState: opts?.reviewState,
        })
      )

      if (response.ok) {
        response.data.data.forEach((qd) => self.questionDefinitionMap.put(qd))
        self.tableQuestionDefinitionIds = cast(response.data.data.map((qd) => qd.id))
        self.currentPage = response.data.meta.currentPage ?? 1
        self.totalPages = response.data.meta.totalPages ?? 1
        self.totalCount = response.data.meta.totalCount ?? 0
      }

      self.isLoading = false
      return response.ok
    }),
    createQuestionDefinition: flow(function* (params: Record<string, any>) {
      const response = yield* toGenerator(self.environment.api.createQuestionDefinition(params))
      if (response.ok) {
        self.questionDefinitionMap.put(response.data.data)
      }
      return response.ok
    }),
    updateQuestionDefinition: flow(function* (id: string, params: Record<string, any>) {
      const response = yield* toGenerator(self.environment.api.updateQuestionDefinition(id, params))
      if (response.ok) {
        self.questionDefinitionMap.put(response.data.data)
      }
      return response.ok
    }),
    archiveQuestionDefinition: flow(function* (id: string) {
      const response = yield* toGenerator(self.environment.api.archiveQuestionDefinition(id))
      if (response.ok) {
        self.questionDefinitionMap.put(response.data.data)
      }
      return response.ok
    }),
    restoreQuestionDefinition: flow(function* (id: string) {
      const response = yield* toGenerator(self.environment.api.restoreQuestionDefinition(id))
      if (response.ok) {
        self.questionDefinitionMap.put(response.data.data)
      }
      return response.ok
    }),
  }))

export interface IQuestionDefinitionStore extends Instance<typeof QuestionDefinitionStoreModel> {}
