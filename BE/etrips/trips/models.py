from django.contrib.auth.models import AbstractUser
from django.db import models
from ckeditor.fields import RichTextField
from cloudinary.models import CloudinaryField


class User(AbstractUser):
    avatar = CloudinaryField(default=None)
    trip_list = models.ManyToManyField('Trip', blank=True, null=True, related_name='trip_list')


class ItemBase(models.Model):
    class Meta:
        abstract = True

    created_date = models.DateTimeField(auto_now=True)
    updated_date = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)


class Post(ItemBase):

    title = models.CharField(max_length=100, null=False, unique=True)
    tags = models.ManyToManyField('Tag', blank=True, null=True)
    trip_post = models.ManyToManyField('Trip', blank=True, null=True, related_name='trip')


class Trip(ItemBase):
    class Meta:
        unique_together = ('title', 'post')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, related_name='owner')
    title = models.CharField(max_length=100, null=False, unique=True)
    image = CloudinaryField(null=True)
    view = models.CharField(max_length=100, null=True, default=None)
    description = RichTextField(default=None)
    time_start = models.DateField(null=False, default=None)
    time_finish = models.DateField(null=False, default=None)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='trip')
    client = models.ManyToManyField(User, blank=True, null=True)
    places = models.ManyToManyField('Place', blank=True, null=True, related_name='place')

    def __str__(self):
        return self.title

    def formatted_time_start(self):
        if self.time_start:
            return self.time_start.strftime("%d/%m/%Y")
        return ""

    def formatted_time_finish(self):
        if self.time_finish:
            return self.time_finish.strftime("%d/%m/%Y")
        return ""


class Place(ItemBase):
    class Meta:
        unique_together = ('title', 'trip')

    title = models.CharField(max_length=100, null=False, unique=True)
    image = CloudinaryField(null=True)
    open_time = models.TimeField()
    content = RichTextField()
    price = models.CharField(max_length=100, null=False, default=None)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='place')

    def __str__(self):
        return self.title


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Interaction(ItemBase):
    class Meta:
        abstract = True

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)


class Comment(Interaction):

    content = models.CharField(max_length=255)


class Like(Interaction):

    class Meta:
        unique_together = ('user', 'trip')


class Report(ItemBase):
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    reported_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported')
    reason = RichTextField()


class Rating(ItemBase):
    rating_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rates')
    image = CloudinaryField(null=True)
    content = RichTextField()
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='rate')