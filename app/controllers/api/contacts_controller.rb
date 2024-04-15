class Api::ContactsController < Api::ApplicationController
  skip_after_action :verify_authorized, only: %i[contact_options]

  def contact_options
    contacts =
      Contact.search(contact_search_params[:query], match: :word_start, where: { contactable_id: current_user.id })

    apply_search_authorization(contacts)
    render_success contacts.map { |c| { label: c.name, value: c } }, nil, { blueprint: ContactOptionBlueprint }
  rescue StandardError => e
    binding.pry
    render_error "contact.options_error", {}, e and return
  end

  def create
    @contact = Contact.build(contact_params)
    @contact.contactable = current_user

    authorize @contact

    if @contact.save
      render_success @contact, "contact.create_success", { blueprint: ContactBlueprint }
    else
      render_error "contact.create_error", message_opts: { error_message: @contact.errors.full_messages.join(", ") }
    end
  end

  private

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
      :professional_number,
    )
  end

  def contact_search_params
    params.permit(%i[query])
  end
end
