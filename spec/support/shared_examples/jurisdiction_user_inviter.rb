require "rails_helper"

AN_INVITED_USER = "an invited user"
A_REINVITED_USER = "a reinvited user"
AN_EXISTING_USER = "an existing user"
AN_INVITED_SUBMITTER = "an invited submitter"

RSpec.shared_examples AN_INVITED_USER do
  it "creates a new user" do
    expect { subject.call }.to change { User.count }.by(1)
  end

  it "sends an invitation email to the user" do
    expect { subject.call }.to have_enqueued_job(ActionMailer::MailDeliveryJob)
  end

  it "includes the user in the invited results" do
    service = subject.call
    expect(service.results[:invited]).not_to be_empty
  end
end

RSpec.shared_examples A_REINVITED_USER do
  it "reinvites the existing user" do
    expect { subject.call }.to change { existing_reviewer.reload.invitation_sent_at }
    subject.call
  end

  it "does not create a new user" do
    expect { subject.call }.not_to change { User.count }
  end

  it "includes the user in the reinvited results" do
    service = subject.call
    expect(service.results[:reinvited]).to include(existing_reviewer)
  end
end

RSpec.shared_examples AN_EXISTING_USER do
  it "does not invite the user" do
    expect { subject.call }.not_to change { existing_reviewer.reload.invitation_sent_at }
    subject.call
  end

  it "includes the user in the email_taken results" do
    service = subject.call
    expect(service.results[:email_taken]).to include(existing_reviewer)
  end
end

RSpec.shared_examples AN_INVITED_SUBMITTER do
  it "does not convert the submitter into the invited user" do
    expect { subject.call }.not_to change { submitter.reload.role }
  end

  it "does not include the submitter in the reinvited results" do
    service = subject.call
    expect(service.results[:reinvited]).not_to include(submitter)
  end
end
