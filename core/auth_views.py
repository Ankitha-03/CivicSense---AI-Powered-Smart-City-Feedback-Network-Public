"""
UNUSED — custom login view that was used during early development.

CustomLoginView is not registered in any URL configuration and is not
called by any active code path. The active citizen login endpoint is
the login_user function in core.views.

Module: core
Author: Ankitha
"""

# Third-party
from dj_rest_auth.views import LoginView as DjRestAuthLoginView


class CustomLoginView(DjRestAuthLoginView):
    """
    UNUSED. Subclass of the dj-rest-auth LoginView kept for reference.

    Was used to inspect request/response data during early development.
    All debug output has been removed. The active login logic lives in
    core.views.login_user.
    """

    def post(self, request, *args, **kwargs):
        """Delegate to the parent dj-rest-auth login handler."""
        return super().post(request, *args, **kwargs)
