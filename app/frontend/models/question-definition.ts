import { Instance, types } from "mobx-state-tree"
import { EQuestionReviewState, ERequirementType } from "../types/enums"
import { IRequirementOptions } from "../types/types"

export const QuestionDefinitionModel = types
  .model("QuestionDefinitionModel", {
    id: types.identifier,
    label: types.string,
    hint: types.maybeNull(types.string),
    instructions: types.maybeNull(types.string),
    inputType: types.enumeration<ERequirementType[]>(Object.values(ERequirementType)),
    inputOptions: types.optional(types.frozen<IRequirementOptions>(), {}),
    requirementCode: types.maybeNull(types.string),
    reviewState: types.optional(
      types.enumeration<EQuestionReviewState[]>(Object.values(EQuestionReviewState)),
      EQuestionReviewState.draft
    ),
    forkedFromId: types.maybeNull(types.string),
    ownerId: types.maybeNull(types.string),
    placementsCount: types.optional(types.number, 0),
    createdAt: types.maybeNull(types.Date),
    updatedAt: types.maybeNull(types.Date),
    discardedAt: types.maybeNull(types.Date),
  })
  .views((self) => ({
    get isApproved(): boolean {
      return self.reviewState === EQuestionReviewState.approved
    },
    get isDiscarded(): boolean {
      return self.discardedAt !== null
    },
  }))

export interface IQuestionDefinition extends Instance<typeof QuestionDefinitionModel> {}
