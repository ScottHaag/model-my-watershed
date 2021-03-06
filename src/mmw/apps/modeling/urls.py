# -*- coding: utf-8 -*-
from __future__ import print_function
from __future__ import unicode_literals
from __future__ import division

from django.conf.urls import patterns, url

from apps.modeling import views

# uuid4 has special characteristics.
# https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_.28random.29
# {12 chars}-{4 chars}-{4 chars}-{4 chars}-{12 chars}
# Third set of characters must start with a '4'.
# Fourth set of characters must start with one of 'a,b,8,9'.
uuid_regex = '(?P<job_uuid>[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-' \
             + '[89abAB][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12})/$'

urlpatterns = patterns(
    '',
    url(r'projects/$', views.projects, name='projects'),
    url(r'projects/(?P<proj_id>[0-9]+)$', views.project, name='project'),
    url(r'scenarios/$', views.scenarios, name='scenarios'),
    url(r'scenarios/(?P<scen_id>[0-9]+)$', views.scenario, name='scenario'),
    url(r'mapshed/$', views.start_mapshed, name='start_mapshed'),
    url(r'jobs/' + uuid_regex, views.get_job, name='get_job'),
    url(r'tr55/$', views.start_tr55, name='start_tr55'),
    url(r'gwlfe/$', views.start_gwlfe, name='start_gwlfe'),
    url(r'boundary-layers/(?P<table_code>\w+)/(?P<obj_id>[0-9]+)/$',
        views.boundary_layer_detail, name='boundary_layer_detail'),
    url(r'boundary-layers-search/$',
        views.boundary_layer_search, name='boundary_layer_search'),
    url(r'export/gms/?$', views.export_gms, name='export_gms'),
    url(r'point-source/$', views.drb_point_sources, name='drb_point_sources'),
)
