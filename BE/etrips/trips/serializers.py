from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from .models import Post, Trip, Place, Tag, User, Comment, Report, Rating


class FormatSerializer(ModelSerializer):
    created_date = serializers.SerializerMethodField()

    def get_created_date(self, instance):
        # Trả về giá trị đã được định dạng của trường created
        return instance.created_date.strftime("%Y-%m-%d %H:%M:%S")



class ClientSeralizer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email']


class UserSerializer(ModelSerializer):
    def to_representation(self, instance):
        req = super().to_representation(instance)
        req['avatar'] = instance.avatar.url
        return req

    def create(self, validated_data):
        data = validated_data.copy()
        user = User(**data)
        user.set_password(user.password)
        user.save()

        return user

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username', 'password', 'avatar']
        extra_kwargs = {
            'password' :{
                'write_only': True
            }
        }


class TagSerializer(ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class ItemSerializer(ModelSerializer):
    def to_representation(self, instance):
        req = super().to_representation(instance)
        req['image'] = instance.image.url
        return req


class PlaceSerializer(ItemSerializer, FormatSerializer):

    class Meta:
        model = Place
        fields = ['id', 'title', 'image', 'created_date']


class PlaceDetailSerializer(PlaceSerializer):

    class Meta:
        model = PlaceSerializer.Meta.model
        fields = PlaceSerializer.Meta.fields + ['open_time', 'content', 'price']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        des_without_tags = data['content'].replace('<p>',' ').replace('</p>', '')
        data['content'] = des_without_tags
        return data

class TripSerializer(ItemSerializer, FormatSerializer):
    client = UserSerializer(many=True, read_only=True)
    place = PlaceSerializer(many=True, read_only=True)


    class Meta:
        model = Trip
        fields = ['id', 'title', 'image','active', 'created_date', 'description', 'time_start', 'time_finish', 'user', 'post', 'client', 'place']

    def get_time_start(self, instance):
        if instance.time_start:
            return instance.time_start.strftime("%d/%m/%Y")
        return ""

    def get_time_finish(self, instance):
        if instance.time_finish:
            return instance.time_finish.strftime("%d/%m/%Y")
        return ""

    def to_representation(self, instance):
        data = super().to_representation(instance)
        des_without_tags = data['description'].replace('<p>', '').replace('</p>', '')
        data['description'] = des_without_tags
        return data

class TripDetailSerializer(ItemSerializer):
    client = UserSerializer(many=True)
    place = PlaceSerializer(many=True)
    user = UserSerializer()


    class Meta:
        model = TripSerializer.Meta.model
        fields = TripSerializer.Meta.fields + ['user', 'post', 'client', 'place']




class PostSerializer(FormatSerializer):
    tags = TagSerializer(many=True)
    trip = TripSerializer(many=True)

    class Meta:
        model = Post
        fields = ['id', 'title', 'created_date', 'tags', 'trip']


class AuthenticatedTripSerializer(TripDetailSerializer):
    liked = serializers.SerializerMethodField()

    def get_liked(self, trip):
        return trip.like_set.filter(active=True).exists()

    class Meta:
        model = TripDetailSerializer.Meta.model
        fields = TripDetailSerializer.Meta.fields + ['liked']


class CommentSerializer(FormatSerializer):
    user = UserSerializer()

    class Meta:
        model = Comment
        fields = ['id', 'content', 'created_date', 'user']


class ReportSerializer(FormatSerializer):
    class Meta:
        model = Report
        fields = '__all__'


class RatingSerializer(ItemSerializer, FormatSerializer):
    rating_user = UserSerializer()
    class Meta:
        model = Rating
        fields = ['id', 'content','image', 'created_date', 'rating_user']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        des_without_tags = data['content'].replace('<p>',' ').replace('</p>', '')
        data['content'] = des_without_tags
        return data