module JwtHelpers
  def stub_jwt_auth(user: nil, token: "stub-token", decode_payload: [{}, {}])
    token_encoder = instance_double(Warden::JWTAuth::TokenEncoder, call: token)
    allow(Warden::JWTAuth::TokenEncoder).to receive(:new).and_return(
      token_encoder
    )

    if user
      user_decoder = instance_double(Warden::JWTAuth::UserDecoder, call: user)
      allow(Warden::JWTAuth::UserDecoder).to receive(:new).and_return(
        user_decoder
      )
    end

    allow_any_instance_of(User).to receive(:on_jwt_dispatch)
    allow(JWT).to receive(:decode).and_return(decode_payload)

    token_encoder
  end

  def stub_jwt_expired(token: "stub-token")
    token_encoder = instance_double(Warden::JWTAuth::TokenEncoder, call: token)
    allow(Warden::JWTAuth::TokenEncoder).to receive(:new).and_return(
      token_encoder
    )
    allow(JWT).to receive(:decode).and_raise(JWT::ExpiredSignature)

    token_encoder
  end
end
