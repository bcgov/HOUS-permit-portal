import { Instance, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"

export const RevisionReasonModel = types
  .model("RevisionReasonModel", {
    id: types.identifier,
    reasonCode: types.string,
    description: types.string,
    discardedAt: types.maybeNull(types.Date),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({}))
  .actions((self) => ({}))

export interface IRevisionReason extends Instance<typeof RevisionReasonModel> {}
