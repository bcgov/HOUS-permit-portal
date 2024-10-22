class Api::ContactsController < Api::ApplicationController
  skip_after_action :verify_authorized, only: %i[contact_options]
  before_action :set_contact, only: %i[update destroy]

  def contact_options
    contacts =
      Contact.search(
        contact_search_params[:query] || "*",
        match: :word_start,
        where: {
          contactable_id: current_user.id
        },
        limit: 10
      ) || []

    apply_search_authorization(contacts)
    render_success contacts.map { |c| { label: c.name, value: c } },
                   nil,
                   { blueprint: ContactOptionBlueprint }
  rescue StandardError => e
    render_error "contact.options_error", {}, e and return
  end

  def create
    @contact = Contact.build(contact_params)
    @contact.contactable = current_user

    authorize @contact

    if @contact.save
      render_success @contact,
                     "contact.create_success",
                     { blueprint: ContactBlueprint }
    else
      render_error "contact.create_error",
                   message_opts: {
                     error_message: @contact.errors.full_messages.join(", ")
                   }
    end
  end

  def update
    authorize @contact

    if @contact.update(contact_params)
      render_success @contact,
                     "contact.update_success",
                     { blueprint: ContactBlueprint }
    else
      render_error "contact.update_error",
                   message_opts: {
                     error_message: @contact.errors.full_messages.join(", ")
                   }
    end
  end

  def destroy
    authorize @contact

    if @contact.destroy
      render_success @contact,
                     "contact.destroy_success",
                     { blueprint: ContactBlueprint }
    else
      render_error "contact.destroy_error",
                   message_opts: {
                     error_message: @contact.errors.full_messages.join(", ")
                   }
    end
  end

  private

  def set_contact
    @contact = Contact.find(params[:id])
  end

  def contact_params
    params.require(:contact).permit(
      :first_name,
      :last_name,
      :title,
      :department,
      :email,
      :phone,
      :extension,
      :cell,
      :organization,
      :address,
      :business_name,
      :professional_association,
      :professional_number
    )
  end

  def contact_search_params
    params.permit(%i[query])
  end
end
