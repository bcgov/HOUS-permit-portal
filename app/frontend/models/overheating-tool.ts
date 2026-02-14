import { Instance, types } from "mobx-state-tree"
import { EPdfGenerationStatus, EPermitProjectRollupStatus } from "../types/enums"
import { IOverheatingDocument, IOverheatingToolJson } from "../types/types"

export const OverheatingToolModel = types
  .model("OverheatingToolModel", {
    id: types.identifier,
    userId: types.maybe(types.string),
    formType: types.maybe(types.string),
    formJson: types.maybe(types.frozen<IOverheatingToolJson>()),
    createdAt: types.maybe(types.Date),
    pdfFileData: types.maybeNull(types.frozen()),
    overheatingDocuments: types.maybe(types.frozen<IOverheatingDocument[]>()),
    pdfGenerationStatus: types.optional(
      types.enumeration(Object.values(EPdfGenerationStatus)),
      EPdfGenerationStatus.notStarted
    ),
    rollupStatus: types.optional(
      types.enumeration([EPermitProjectRollupStatus.newDraft, EPermitProjectRollupStatus.newlySubmitted]),
      EPermitProjectRollupStatus.newDraft
    ),
    discardedAt: types.maybeNull(types.Date),
  })
  .views((self) => ({
    get isDiscarded() {
      return !!self.discardedAt
    },
  }))

export interface IOverheatingTool extends Instance<typeof OverheatingToolModel> {}
