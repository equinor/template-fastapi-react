from authentication.models import ACL, AccessLevel, User
from common.exceptions import MissingPrivilegeException
from config import config


def access_control(acl: ACL, access_level_required: AccessLevel, user: User):
    """
    This is the main access control function.
    It will either return True or an MissingPrivilegeException.
    Input is the ACL for the document to check, the AccessLevel required for the action,
    and the requests authenticated user.
    """
    if not config.AUTH_ENABLED:
        return True

    if not user.scope.check_privilege(access_level_required):  # The user object has a limited scope set in PAT.
        raise MissingPrivilegeException(f"The requested operation requires '{access_level_required.name}' privileges")

    # Starting with the 'others' access level should reduce the amount of checks being done the most
    if acl.others.check_privilege(access_level_required):
        return True
    # The owner always has full access
    if acl.owner == user.user_id:
        return True

    for role in user.roles:
        if role_access := acl.roles.get(role):
            if role_access.check_privilege(access_level_required):
                return True

    if direct_user_access := acl.users.get(user.user_id):
        if direct_user_access.check_privilege(access_level_required):
            return True

    # No access high enough granted neither as 'owner', 'roles', 'users', nor 'others'.
    raise MissingPrivilegeException(f"The requested operation requires '{access_level_required.name}' privileges")


def create_acl(user: User) -> ACL:
    """Used when there is no ACL to inherit. Sets the current user as owner, and rest copies DEFAULT_ACL"""
    return ACL(owner=user.user_id, roles=DEFAULT_ACL.roles, others=DEFAULT_ACL.others)


DEFAULT_ACL = ACL(
    owner=config.APPLICATION_ADMIN,
    roles={config.APPLICATION_ADMIN_ROLE: AccessLevel.WRITE},
    others=AccessLevel.READ,
)
