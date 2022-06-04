from jose import jwt

from authentication.models import User
from config import default_user

# Generated with: 'openssl req  -nodes -new -x509  -keyout server.key -out server.cert'
mock_rsa_private_key = """
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDfsOW9ih/oBUwl
LEH4t2C2GZeq3/dEXCkK54CNPZv979rir0nQQ5pLVcoohoVFe+QwC746xg8t7/YP
cWHwcHXkRBgwRXHATJmD3MjXp/kCIoIUe2Qt8Or/j1BDhqpxkJcoBfiTt2kBecHc
CgHmkQg5g0QGB0dTi+c3nUNk8HscxGU2jFSjFunlyVxHpujNfkA7m/hu5B12ggt6
HclrOzdb2s/Lop017uEQ18+HJrja/b1+EVqdQfET0FFQu3cgr+b0PHjWYKHoUGA0
0Whpw3YjCfyr7aBRVQwOdBDxwJgWcozxCVBs+srjqscikj2KEE4MtsLgtz/FqK/T
ibwdhteDAgMBAAECggEAb19uI37AAA+TJ/bvKdxzpHb9krBMNpcEQE+fK7N/FWH0
w2SvBaiDC/s82gyQElZq+JkAL9co+6A8DNhRARudNvfIa1BIIIyC6qpkvSr+yddQ
mM4OxOjsuC0ss1I7TqvE9sJyT2nEOF3c7ad15sxTIf9/QNki5DAGASSlx34MbfdU
VUvkmY6HDFFMSd5G9JedEpBNKnY2+ZPQk4SHpm8IDiJ1FxkDWu9kTxJFetTDpSZ6
OEyvbwGSzNkWRkmprv6X9uF7JzQ/BE7PxDrWQPvbjMye63WN4/y/wuKDxMzCM2bl
vWhQPQmEyYJt+DhobtiNQr+zY1rrtKHNtfxAHuY8wQKBgQD3yiIHfHoJWfRdOhkz
Q6cdbuxm1B9vij4M95kGQmv39sNCyPeu860PQ8nmTuDyh7VmuXuuC0DaZiVfblod
cU27y9EBSdFAI613t8VDqgJIj5ghoFmYuSYWbGJnNKK0xgecQwRyDhzCzCr5jjtV
ydPHKv3WA6pKlOBULU7ZmN7wEQKBgQDnGllfGxItzW8H6MTrai/fI2JK1PCicEzD
qGdlKYqsfF+gRFGA8IAujB6+Q8Gq8e8j3CVD6cm3XhFaC+5FrH5/yLVjLTnNDzOk
YYlGsLS7FrMF3ZV+eURZMiRwrPdr10onDAYcaw+p8/MK3Rybl57ElaT7FkYImptu
hwFMOFDiUwKBgFzsZ6CJFLbnDhXcENFBwKzwCSVyzSsmG6j/PVq0lArUdltYRFJO
vYqo8FE3KXKqY+PXEUOuoq6EeeV028SI1g7kG0gxZ5B3ELmBqC981QhjGTkbCh6U
6GymTqzHd3D1hqsaEtO26SBAMqmNpkDAxHO/cpvMmhMIC6xlpVlC0/ARAoGALwCD
5rzpwJkEmPY1fq+1FsvqhM+0NUVjx3Nru/5r7tLI3B6o+PFxEIZ9BjNfozXbbk6q
4Zod5YZjPw4oItGHVNPsWERtehA6b5dKxS7RQy/Fr062xedCCGYTVTtIgw1hTnm6
kHMR133/E1mPJPH8X30T9eE80ykmrZ8Vm3vkr3MCgYEAjDtNvW/sZ/J1go5bDuzE
SqNUf+yp+lcftsuzzx+AC9kyQA23LfZVcW9JLbAeWVxELF1s3unOBIwe98gk4LC9
j9QyibKClixQO204dsxsNECCxHTnL2EUmV6zt/kmuLsRBico/85MF3aKcvljVuV7
Ps2+z0zvD9eqCcQ4YrrqXGM=
-----END PRIVATE KEY-----
"""

# Python-jose require public keys instead of x509 certs.
# Convert cert to pub key with: 'openssl x509 -pubkey -noout < server.cert'
mock_rsa_public_key = """
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA37DlvYof6AVMJSxB+Ldg
thmXqt/3RFwpCueAjT2b/e/a4q9J0EOaS1XKKIaFRXvkMAu+OsYPLe/2D3Fh8HB1
5EQYMEVxwEyZg9zI16f5AiKCFHtkLfDq/49QQ4aqcZCXKAX4k7dpAXnB3AoB5pEI
OYNEBgdHU4vnN51DZPB7HMRlNoxUoxbp5clcR6bozX5AO5v4buQddoILeh3Jazs3
W9rPy6KdNe7hENfPhya42v29fhFanUHxE9BRULt3IK/m9Dx41mCh6FBgNNFoacN2
Iwn8q+2gUVUMDnQQ8cCYFnKM8QlQbPrK46rHIpI9ihBODLbC4Lc/xaiv04m8HYbX
gwIDAQAB
-----END PUBLIC KEY-----
"""


def generate_mock_token(user: User = default_user):
    """
    This function is for testing purposes only
    Used for behave testing
    """
    # https://docs.microsoft.com/en-us/azure/active-directory/develop/id-tokens#claims-in-an-id-token
    payload = {
        "name": user.full_name,
        "preferred_username": user.email,
        "scp": "FoR_test_scope",
        "sub": user.user_id,
        "roles": user.roles,
        "iss": "mock-auth-server",
    }
    token = jwt.encode(payload, mock_rsa_private_key, algorithm="RS256")
    return token
