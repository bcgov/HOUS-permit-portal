require "rails_helper"

RSpec.describe ApplicationMailer do
  # Define a concrete mailer so we can call the protected `send_mail` helper.
  class TestMailer < ApplicationMailer
    def test_email(to:)
      send(:send_mail, email: to, template_key: "welcome")
    end

    def test_email_with_subject_override(to:)
      send(
        :send_mail,
        email: to,
        template_key: "welcome",
        subject_key: "other_subject",
        subject_i18n_params: {
          foo: "bar"
        }
      )
    end
  end

  before do
    allow(FrontendUrlHelper).to receive(:root_url).and_return(
      "http://example.test/"
    )
    allow(I18n).to receive(:t).and_call_original
    allow(I18n).to receive(:t).with(
      "application_mailer.subject_start"
    ).and_return("Permit Hub")
    allow(I18n).to receive(:t).with(
      "application_mailer.subjects.welcome"
    ).and_return("Welcome")
    allow(I18n).to receive(:t).with(
      "application_mailer.subjects.other_subject",
      foo: "bar"
    ).and_return("Other")
  end

  it "builds subject and uses template_key as template_name" do
    mailer = TestMailer.new
    captured = nil
    allow(mailer).to receive(:mail) do |args|
      captured = args
      :ok
    end

    mailer.test_email(to: "to@example.com")

    expect(mailer.instance_variable_get(:@root_url)).to eq(
      "http://example.test/"
    )
    expect(captured[:to]).to eq("to@example.com")
    expect(captured[:subject]).to eq("Permit Hub - Welcome")
    expect(captured[:template_name]).to eq("welcome")
  end

  it "uses subject_key override and subject params" do
    mailer = TestMailer.new
    captured = nil
    allow(mailer).to receive(:mail) do |args|
      captured = args
      :ok
    end

    mailer.test_email_with_subject_override(to: "to@example.com")

    expect(captured[:subject]).to eq("Permit Hub - Other")
  end
end
