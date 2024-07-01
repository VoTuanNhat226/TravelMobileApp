from django.contrib import admin
from django.core.exceptions import ValidationError
from django.db.models import Count, F
from django.template.response import TemplateResponse
from django.utils.html import mark_safe
from .models import Post, Trip, Place, Tag, Comment, Like, Report, Rating, User
from django import forms
from ckeditor_uploader.widgets import CKEditorUploadingWidget
from django.urls import path


class TripForm(forms.Form):
    description = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        models = Trip
        fields = '__all__'

class PlaceForm(forms.Form):
    description = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        models = Trip
        fields = '__all__'


class PlaceInlineAdmin(admin.StackedInline):
    model = Place
    fk_name = 'trip'


class TripAdmin(admin.ModelAdmin):
    inlines = (PlaceInlineAdmin, )

    forms = TripForm
    list_display = ["id", "title", "active", 'time_start', 'time_finish']
    search_fields = ["title", "created_date", "post__title"]
    list_filter = ["title", "post__title"]
    readonly_fields = ["trip_image"]

    def save_model(self, request, obj, form, change):
        if obj.time_start and obj.time_finish and obj.time_start > obj.time_finish:
            raise ValidationError("Ngày bắt đầu không thể lớn hơn ngày kết thúc")
        super().save_model(request, obj, form, change)

    def trip_image(self, Trip):
        return mark_safe(
            "<img src='/static/{img_url}' />".format(img_url=Trip.image.name, alt=Trip.title)
        )

class PlaceAdmin(admin.ModelAdmin):

    forms =PlaceForm
    list_display = ["id", "title", "active",]
    readonly_fields = ["place_image"]



    def place_image(self, Trip):
        return mark_safe(
            "<img src='/static/{img_url}' />".format(img_url=Place.image.name, alt=Place.title)
        )


class TripAppAdminSite(admin.AdminSite):
    site_header = 'HE THONG CHIA SE HANH TRINH'

    def get_urls(self):
        return [path('trip-stats/', self.stats_view)] + super().get_urls()

    def stats_view(self, request):
        trip_stats = Trip.objects.values('title').annotate(c=F('view'))
        return TemplateResponse(request, 'admin/stats.html', {
            "trip_stats": trip_stats
        })


admin_site = TripAppAdminSite('mytrip')

# admin.site.register(Post)
# admin.site.register(Trip, TripAdmin)
# admin.site.register(Place)
# admin.site.register(Tag)

admin_site.register(Post)
admin_site.register(Trip, TripAdmin)
admin_site.register(Place, PlaceAdmin)
admin_site.register(Tag)
admin_site.register(Comment)
admin_site.register(Like)
admin_site.register(Report)
admin_site.register(Rating)
admin_site.register(User)