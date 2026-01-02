import { Instance, types } from "mobx-state-tree"
import { EPdfGenerationStatus } from "../types/enums"
import { IOverheatingDocument } from "../types/types"

export const PdfFormModel = types.model("PdfFormModel", {
  id: types.identifier,
  userId: types.string,
  formType: types.string,
  formJson: types.frozen(),
  status: types.boolean,
  createdAt: types.maybe(types.Date),
  pdfFileData: types.maybeNull(types.frozen()),
  overheatingDocuments: types.maybe(types.frozen<IOverheatingDocument[]>()),
  pdfGenerationStatus: types.optional(
    types.enumeration<EPdfGenerationStatus>(Object.values(EPdfGenerationStatus)),
    EPdfGenerationStatus.notStarted
  ),
})

export interface IPdfForm extends Instance<typeof PdfFormModel> {}
