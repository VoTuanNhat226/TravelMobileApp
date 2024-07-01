from django.contrib import admin
from django.urls import path, re_path, include
from .admin import admin_site
from rest_framework.routers import DefaultRouter
from . import views
router = DefaultRouter()
router.register('trips', views.TripViewSet)
router.register('posts', views.PostViewSet)
router.register('places', views.PlaceViewSet)
router.register('users', views.UserViewSet)
router.register('comments', views.CommentViewSet)
router.register('reports', views.ReportViewSet)
router.register('ratings', views.RatingViewSet)
# router.register('like', views.LikeViewSet)
# /trips/ - GET
# /trips/ - POST
# /trips/{trip_id}/ - GET
# /trips/{trip_id}/ - PUT
# /trips/{trip_id}/ - DELETE

urlpatterns = [
    path('', include(router.urls)),
    path('admin/', admin_site.urls),
    # re_path(r'^ckeditor/', include('ckeditor_uploader.urls')),

]