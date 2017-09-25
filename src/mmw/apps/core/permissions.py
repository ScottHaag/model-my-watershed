# -*- coding: utf-8 -*-
from __future__ import print_function
from __future__ import unicode_literals

from rest_framework.permissions import BasePermission
from rest_framework.authentication import TokenAuthentication

from django.conf import settings


class IsTokenAuthenticatedOrClientApp(BasePermission):
    """
    TODO This is just to test the token authentication
    Only anonymous requests from the client app should
    be allowed:
    https://github.com/WikiWatershed/model-my-watershed/issues/2270
    Currently all anonymous requests are allowed, unless you're using
    swagger
    """

    def has_permission(self, request, view):
        token_authenticated = type(request.successful_authenticator) \
            is TokenAuthentication
        is_client_app = 'HTTP_X_USER' in request.META and \
                        request.META['HTTP_X_USER'] == 'client_app'
        return is_client_app or token_authenticated
