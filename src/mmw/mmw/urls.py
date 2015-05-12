# -*- coding: utf-8 -*-
from __future__ import print_function
from __future__ import unicode_literals
from __future__ import division

from django.conf.urls import patterns, include, url
from django.contrib import admin
from rest_framework import routers

import registration.backends.default.urls
import watchman.urls
import rest_framework.urls

import apps.geocode.urls
import apps.watershed_model.urls
import apps.analyze.urls
import apps.home.urls
import apps.home.views
import apps.water_balance.urls

admin.autodiscover()

router = routers.DefaultRouter()
router.register(r'users', apps.home.views.UserViewSet)

urlpatterns = patterns(
    '',
    url(r'^', include(apps.home.urls)),
    url(r'^api/', include(router.urls)),
    url(r'^api-auth/', include(rest_framework.urls,
                               namespace='rest_framework')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^watchman/', include(watchman.urls)),
    url(r'^accounts/', include(registration.backends.default.urls)),
    url(r'^api/geocode/', include(apps.geocode.urls)),
    url(r'^api/watershed_model/', include(apps.watershed_model.urls)),
    url(r'^api/analyze/', include(apps.analyze.urls)),
    url(r'^simple/', include(apps.water_balance.urls)),
)
