class Api::InfoDocumentsController < Api::ApplicationController
  skip_before_action :authenticate_user!, only: %i[index show]
  skip_before_action :require_confirmation, only: %i[index show]

  before_action :set_info_document,
                only: %i[show update destroy publish unpublish]

  def index
    documents =
      info_documents_scope.ordered.includes(:document_file, :topics)

    render_success(documents, nil, { blueprint: InfoDocumentBlueprint })
  end

  def show
    authorize @info_document

    render_success(@info_document, nil, { blueprint: InfoDocumentBlueprint })
  end

  def create
    document = InfoDocument.new(info_document_params)
    authorize document

    if document.save
      render_success(document, "info_document.create_success")
    else
      render_validation_error(document)
    end
  rescue Shrine::FileNotFound
    render_file_not_found_error
  end

  def update
    authorize @info_document

    @info_document.assign_attributes(info_document_params)

    if @info_document.save
      render_success(@info_document, "info_document.update_success")
    else
      render_validation_error(@info_document)
    end
  rescue Shrine::FileNotFound
    render_file_not_found_error
  end

  def destroy
    authorize @info_document

    @info_document.destroy!
    render_success(nil, "info_document.destroy_success")
  end

  def publish
    authorize @info_document

    if @info_document.update(published_at: Time.current)
      render_success(@info_document, "info_document.publish_success")
    else
      render_validation_error(@info_document)
    end
  end

  def unpublish
    authorize @info_document

    if @info_document.update(published_at: nil)
      render_success(@info_document, "info_document.unpublish_success")
    else
      render_validation_error(@info_document)
    end
  end

  def reorder
    authorize InfoDocument, :reorder?

    ordered_ids = params[:ordered_ids] || []
    documents = InfoDocument.where(id: ordered_ids)

    if documents.size != ordered_ids.size
      return render_error "misc.not_found_error", { status: :not_found }
    end

    InfoDocument.transaction do
      ordered_ids.each_with_index do |id, index|
        documents.find { |document| document.id == id }.insert_at(index)
      end
    end

    render_success(
      InfoDocument.ordered.includes(:document_file, :topics),
      "info_document.reorder_success",
      { blueprint: InfoDocumentBlueprint }
    )
  end

  private

  def info_documents_scope
    documents = policy_scope(InfoDocument)
    return documents.published if published_only?

    documents
  end

  def published_only?
    ActiveModel::Type::Boolean.new.cast(params[:published_only])
  end

  def set_info_document
    @info_document =
      InfoDocument.includes(:document_file, :topics).find(params[:id])
  rescue ActiveRecord::RecordNotFound => e
    render_error "misc.not_found_error", { status: :not_found }, e
  end

  def info_document_params
    params.require(:info_document).permit(
      :title,
      :description,
      :publish,
      topic_list: [],
      document_file_attributes: document_attributes
    )
  end

  def document_attributes
    [
      :id,
      :_destroy,
      {
        file: [
          :id,
          :storage,
          { metadata: %i[filename size mime_type content_disposition] }
        ]
      }
    ]
  end

  def render_validation_error(record)
    render_error(
      "misc.validation_error",
      {
        message_opts: {
          error_message: record.errors.full_messages.join(", ")
        }
      }
    )
  end

  def render_file_not_found_error
    render_error "permit_application.file_not_found_error"
  end
end
