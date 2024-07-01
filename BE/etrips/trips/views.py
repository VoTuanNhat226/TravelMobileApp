from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, generics, status, parsers, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from . import paginator, permissons, serializers
import datetime
from datetime import timedelta
from .models import Trip, Post, Place, User, Comment, Like, Report, Rating
from .serializers import TripSerializer, PostSerializer, PlaceSerializer, PlaceDetailSerializer, UserSerializer, CommentSerializer, AuthenticatedTripSerializer, ReportSerializer, RatingSerializer, TripDetailSerializer


class PostViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    pagination_class = paginator.ItemPaginator
    # permission_classes = [permissions.IsAuthenticated] Chứng thực rồi mới được xem api


class TripViewSet(viewsets.ViewSet, generics.ListAPIView, generics.UpdateAPIView, generics.DestroyAPIView, generics.CreateAPIView):
    queryset = Trip.objects.filter(active=True)
    serializer_class = TripSerializer
    pagination_class = paginator.TripPaginator
    parser_classes = [parsers.MultiPartParser, ]
    # Xác thực người dùng
    def get_permissons(self):
        if self.action in ['add_comment', 'add_like', 'delete_comment']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.request.user.is_authenticated:
            return serializers.AuthenticatedTripSerializer

        return self.serializer_class

    def get_queryset(self):
        # Lọc chuyến đi theo các tiêu chí
        queryset = self.queryset

        if self.action == 'list':
            title = self.request.query_params.get('title')
            time_start = self.request.query_params.get('time_start')
            time_finish = self.request.query_params.get('time_finish')
            q = self.request.query_params.get('q')
            post_id = self.request.query_params.get('post_id')

            if q:
                queryset = queryset.filter(title__icontains=q)

            # Lọc theo danh mục bài đăng
            if post_id:
                queryset = queryset.filter(post_id=post_id)

            # Lọc theo tiêu đề
            if title:
                queryset = queryset.filter(title__icontains=title)

            # Lọc theo thời gian bắt đầu
            if time_start:
                queryset = queryset.filter(time_start=time_start)

            # Lọc theo thời gian kết thúc
            if time_finish:
                queryset = queryset.filter(time_finish=time_finish)

        return queryset

    # API ấy chi tiết 1 chuyến đi
    def retrieve(self, request, pk):
        return Response(TripDetailSerializer(self.get_object()).data, status=status.HTTP_200_OK)

    # API lấy một địa điểm trong 1 chuyến đi
    @action(methods=['get'], url_path='places', detail=True)
    def get_places(self, request, pk):  # lấy một địa điểm trong 1 chuyến đi
        places = self.get_object().place.filter(active=True)
        return Response(PlaceSerializer(places, many=True).data,
                        status=status.HTTP_200_OK)

    # API Tạo 1 place trong 1 chuyến đi
    @action(methods=['post'], url_path='places', detail=True)
    def add_place(self, request, pk):
        trip = self.get_object()
        c = self.get_object().place.create(content=request.data.get('content'),
                                               title = request.data.get('title'),
                                               image = request.data.get('image'),
                                               trip = trip,
                                               open_time=request.data.get('open_time'),
                                               price = request.data.get('price'))
        return Response(PlaceDetailSerializer(c).data, status=status.HTTP_201_CREATED)

    # Ẩn những địa điểm trong quá khứ
    @action(methods=['get'], detail=True,
            url_path="hide-trip", url_name="hide-trip")
    # /trips/{pk}/hide-trip
    def hide_trip(self, request, pk):
        try:
            t = Trip.objects.get(pk=pk)

            # Tính toán ngày kết thúc + 7 ngày
            if t.time_finish:
                end_date_plus_7_days = t.time_finish + timedelta(days=7)

                # Kiểm tra xem chuyến đi đã qua khoảng thời gian 7 ngày kể từ ngày kết thúc chưa
                if datetime.date.today() > end_date_plus_7_days:
                    t.active = False
                    t.save()
                    return Response(status=status.HTTP_200_OK)
                else:
                    return Response(status=status.HTTP_400_BAD_REQUEST)

        except Trip.DoesNotExist:
            return Response(status=status.HTTP_400_BAD_REQUEST)


    # API like 1 chuyến đi
    @action(methods=['post'], url_path='like', detail=True)
    def add_like(self, request, pk):
        li, created = Like.objects.get_or_create(trip=self.get_object(), user=request.user)
        if not created:
            li.active = not li.active
            li.save()
        return Response(AuthenticatedTripSerializer(self.get_object()).data)

    #API kiểm tra trạng thái like
    @action(methods=['get'], url_path='check_liked', detail=True)
    def check_like(self, request, pk):
        trip = self.get_object()
        user = request.user
        liked = Like.objects.filter(trip=trip, user=user, active=1).exists()
        if not liked:
            return Response({'liked': False}, status=status.HTTP_200_OK)
        return Response({'liked': True }, status=status.HTTP_200_OK)

    # API cập nhật một phần địa điểm vào chuyến đi
    # /trips/{pk}/places/{place_id}/partial-update/

    @action(detail=True, methods=['patch'], url_path='places/(?P<place_id>\d+)/partial-update',
            url_name='partial_update_place')
    def partial_update_place(self, request, pk=None, place_id=None):
        try:
            # Lấy chuyến đi từ pk
            trip = get_object_or_404(Trip, pk=pk)

            # Lấy địa điểm từ place_id
            place = get_object_or_404(Place, pk=place_id)

            # Kiểm tra xem địa điểm có thuộc chuyến đi hay không
            if place.trip != trip:
                return Response({"error": "Place does not belong to this Trip."},
                                status=status.HTTP_400_BAD_REQUEST)

            # Kiểm tra quyền chỉnh sửa địa điểm: Người viết địa điểm hoặc admin mới được chỉnh sửa
            if not request.user.is_authenticated:
                return Response({"error": "You do not have permission to update this place."},
                                status=status.HTTP_403_FORBIDDEN)

            # Cập nhật một phần của địa điểm
            for k, v in request.data.items():
                setattr(place, k, v)  # Thay vì viết place.key  = value
            place.save()

            return Response(serializers.PlaceSerializer(place).data, status=status.HTTP_200_OK)

        except Trip.DoesNotExist:
            return Response({"error": "Trip not found."}, status=status.HTTP_404_NOT_FOUND)
        except Place.DoesNotExist:
            return Response({"error": "Place not found."}, status=status.HTTP_404_NOT_FOUND)

    # API xóa địa điểm trong 1 chuyến đi
    @action(methods=['delete'], detail=True, url_path='places/(?P<place_id>\d+)/delete')
    def delete_places(self, request, pk=None, place_id=None):
        try:
            # Lấy chuyến đi từ pk
            trip = get_object_or_404(Trip, pk=pk)

            # Lấy địa điểm từ place_id
            place = get_object_or_404(Place, pk=place_id)

            # Kiểm tra xem địa điểm có thuộc chuyến đi hay không
            if place.trip != trip:
                return Response({"error": "Place does not belong to this Trip."},
                                status=status.HTTP_400_BAD_REQUEST)

            # Kiểm tra quyền xóa địa điểm
            # if request.user != application.applicant.user and not request.user.is_staff:
            #     return Response({"error": "You do not have permission to delete this job application."},
            #                     status=status.HTTP_403_FORBIDDEN)

            # Xóa địa điểm
            place.delete()
            return Response({"message": "Place deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

        except Trip.DoesNotExist:
            return Response({"error": "Trip not found."}, status=status.HTTP_404_NOT_FOUND)
        except Place.DoesNotExist:
            return Response({"error": "Place not found."}, status=status.HTTP_404_NOT_FOUND)

    # API Tạo mới và xem danh sách các đánh giá của 1 chuyến đi
    @action(methods=['get', 'post'], detail=True, url_path='ratings')
    def ratings(self, request, pk=None):
        try:
            if request.method == 'POST':
                content = request.data.get('content')
                image = request.data.get('image')
                trip = Trip.objects.filter(active=True, pk=pk).first()
                Rating.objects.create(rating_user=request.user, content=content,image=image, trip=trip)
                return Response(status=status.HTTP_201_CREATED)

            elif request.method == 'GET':
                #Lấy danh sách các đánh giá trong 1 chuyến đi
                trip = self.get_object()
                rates = Rating.objects.filter(trip=trip, active=True)

                return Response(RatingSerializer(rates, many=True).data,
                                status=status.HTTP_200_OK)
        except Trip.DoesNotExist:
            return Response({"error": "Recruitment post not found."}, status=status.HTTP_404_NOT_FOUND)

    # API cập nhật rating một chuyến đi
    # /trips/{pk}/ratings/{rating_id}/partial-update/
    @action(detail=True, methods=['patch'], url_path='ratings/(?P<rating_id>\d+)/partial-update')
    def partial_update_rating(self, request, pk=None, rating_id=None):
        try:
            # Lấy chuyến đi từ pk
            trip = get_object_or_404(Trip, pk=pk)
            # Lấy rating từ rating_id
            rating = get_object_or_404(Rating, pk=rating_id)
            # Kiểm tra xem rating có thuộc về chuyến đi không
            if rating.trip != trip:
                return Response({"error": "Rating does not belong to this trip."},
                                status=status.HTTP_400_BAD_REQUEST)
            # # Kiểm tra quyền chỉnh sửa Rating: chỉ người tạo mới được chỉnh sửa, admin cũng không được cập nhật
            # user = getattr(request.user, 'applicant', None) or getattr(request.user, 'employer', None)
            # if user != rating.applicant and user != rating.employer:
            #     return Response({"error": "You do not have permission to delete this rating."},
            #                     status=status.HTTP_403_FORBIDDEN)

            # Cập nhật một phần của rating
            for key, value in request.data.items():
                setattr(rating, key, value)
            rating.save()
            # Serialize và trả về thông tin cập nhật của rating
            serializer = RatingSerializer(rating)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Trip.DoesNotExist:
            return Response({"error": "Recruitment post not found."}, status=status.HTTP_404_NOT_FOUND)
        except Rating.DoesNotExist:
            return Response({"error": "Rating not found."}, status=status.HTTP_404_NOT_FOUND)

    # API xóa rating của một chuyến đi
    # /trips/<pk>/ratings/<rating_id>/delete/
    @action(detail=True, methods=['delete'], url_path='ratings/(?P<rating_id>\d+)/delete',
            url_name='delete_rating')
    def delete_rating(self, request, pk=None, rating_id=None):
        try:
            # Lấy chuyến đi từ pk
            trip = get_object_or_404(Trip, pk=pk)

            # Lấy rating từ rating_id
            rating = get_object_or_404(Rating, pk=rating_id)

            # Kiểm tra xem rating có thuộc về bài đăng tuyển dụng không
            if rating.trip != trip:
                return Response({"error": "Rating does not belong to this trip."},
                                status=status.HTTP_400_BAD_REQUEST)

            # # Kiểm tra quyền xóa rating: chỉ có người tạo và admin mới được xóa
            # user = getattr(request.user, 'applicant', None) or getattr(request.user, 'employer', None)
            # if user != rating.applicant and user != rating.employer and not request.user.is_staff:
            #     return Response({"error": "You do not have permission to delete this comment."},
            #                     status=status.HTTP_403_FORBIDDEN)

            # Xóa rating
            rating.delete()

            return Response({"message": "Rating deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

        except Trip.DoesNotExist:
            return Response({"error": "Recruitment post not found."}, status=status.HTTP_404_NOT_FOUND)
        except Rating.DoesNotExist:
            return Response({"error": "Rating not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(methods=['post'], url_path='add_trip', detail=False)
    def add_trip(self, request):
        c = Trip.objects.create(title=request.data.get('title'),
                                image=request.data.get('image'),
                                description=request.data.get('description'),
                                time_start=request.data.get('time_start'),
                                time_finish=request.data.get('time_finish'),
                                post_id=request.data.get('post_id'),
                                user=request.user)
        return Response(TripSerializer(c).data, status=status.HTTP_201_CREATED)

    # API Tạo 1 comment trong 1 chuyến đi
    @action(methods=['post'], url_path='comments', detail=True)
    def add_comment(self, request, pk):
        c = self.get_object().comment_set.create(content=request.data.get('content'), user=request.user)
        return Response(CommentSerializer(c).data, status=status.HTTP_201_CREATED)

    # Lấy danh sách comment trong 1 chuyến đi
    @action(methods=['get'], url_path='get_comments', detail=True)
    def get_comments(self, request, pk):
        comments = self.get_object().comment_set.select_related('user').order_by('-id')
        page = paginator.CommentPaginator().paginate_queryset(comments, request)  # self.paginate_queryset(comments)
        if page is not None:
            serializer = CommentSerializer(page, many=True)
            return Response(serializer.data)

        return Response(CommentSerializer(comments, many=True).data)

    # API xóa 1 comment trong 1 chuyến đi
    @action(methods=['delete'], url_path='comments/(?P<comment_id>\\d+)/delete', detail=True)
    def delete_comment(self, request, pk=None, comment_id=None):
        # Lấy chuyến đi từ pk
        try:
            trip = get_object_or_404(Trip, pk=pk)

            # Lấy comment từ comment_id
            comment = get_object_or_404(Comment, pk=comment_id)

            # Kiểm tra xem comment có thuộc về chuyến đi không
            if comment.trip != trip:
                return Response({"error": "Comment does not belong to this trip."},
                                status=status.HTTP_400_BAD_REQUEST)


            # Xóa comment
            comment.delete()

            return Response({"message": "Comment deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

        except Trip.DoesNotExist:
            return Response({"error": "Trip post not found."}, status=status.HTTP_404_NOT_FOUND)
        except Comment.DoesNotExist:
            return Response({"error": "Comment not found."}, status=status.HTTP_404_NOT_FOUND)

    # API cập nhật một phần comment trong chuyến đi
    # /trips/{pk}/comments/{comment_id}/partial-update/
    @action(detail=True, methods=['patch'], url_path='comments/(?P<comment_id>\d+)/partial-update',
            url_name='partial_update_comment')
    def partial_update_comment(self, request, pk=None, comment_id=None):
        try:
            # Lấy chuyến đi từ pk
            trip = get_object_or_404(Trip, pk=pk)

            # Lấy comment từ comment_id
            comment = get_object_or_404(Comment, pk=comment_id)

            # Kiểm tra xem comment có thuộc về chuyến đi không
            if comment.trip != trip:
                return Response({"error": "Comment does not belong to this trip."},
                                status=status.HTTP_400_BAD_REQUEST)

            # user = getattr(request.user, 'applicant', None) or getattr(request.user, 'employer', None)
            # if user != comment.applicant and user != comment.employer:
            #     return Response({"error": "You do not have permission to delete this comment."},
            #                     status=status.HTTP_403_FORBIDDEN)

            # Cập nhật một phần của comment
            for key, value in request.data.items():
                setattr(comment, key, value)
            comment.save()

            return Response(CommentSerializer(comment).data, status=status.HTTP_200_OK)

        except Trip.DoesNotExist:
            return Response({"error": "Trip post not found."}, status=status.HTTP_404_NOT_FOUND)
        except Comment.DoesNotExist:
            return Response({"error": "Comment not found."}, status=status.HTTP_404_NOT_FOUND)


class PlaceViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer
    pagination_class = paginator.ItemPaginator

    def retrieve(self, request, pk):
        return Response(PlaceDetailSerializer(self.get_object()).data, status=status.HTTP_200_OK)

        # places = self.get_object().place.filter(active=True)
        # return Response(PlaceDetailSerializer(places, many=True).data,
        #                 status=status.HTTP_200_OK)


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [parsers.MultiPartParser, ]

    def get_permissions(self):
        if self.action in ['get_current_user']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    @action(methods=['get', 'patch'], url_path='current_user', detail=False)
    def get_current_user(self, request):
        user = request.user
        if request.method.__eq__('PATCH'):
            for k, v, in request.data.items():
                setattr(user, k, v)
            user.save()

        return Response(UserSerializer(user).data)

    # API khóa 1 tài khoản sau khi bị báo cáo 3 lần
    @action(methods=['post'], detail=True)
    def block_account(self, request, pk):
        user = self.get_object()
        reports_count = Report.objects.filter(reported_user=user).count()

        if reports_count >= 3:
            user.is_active = False
            user.save()
            return Response({'message': 'Account blocked successfully.'})
        else:
            return Response({'message': 'Insufficient reports to block the account.'})

    # API lấy danh sách các user đã bị report
    @action(methods=['get'], detail=False, url_path='user_reported')
    def get_user_reported(self, request):
        reported_user = User.objects.filter(is_active=True)
        serializer = UserSerializer(reported_user, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['get'], detail=True, url_path='get_trips')
    def get_trips(self, request, pk):
        trips = Trip.objects.filter(user_id=pk, active=True)  # Lọc danh sách chuyến đi dựa trên user_id và active=True
        return Response(TripSerializer(trips, many=True).data, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, url_path='report')
    def report_user(self, request, pk):
        reported_user = self.get_object()
        reason = request.data.get('reason')
        reporter = request.user
        if reported_user == reporter:
            return Response({'message': 'You cannot report yourself.'}, status=status.HTTP_400_BAD_REQUEST)
        c = Report.objects.create(reporter=reporter, reported_user=reported_user, reason=reason)
        return Response(ReportSerializer(c).data, status=status.HTTP_200_OK)

class CommentViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    pagination_class = paginator.CommentPaginator
    permission_classes = [permissons.CommentOwner]


# Create your views here.


class ReportViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView, generics.DestroyAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    pagination_class = paginator.ItemPaginator
    permission_classes = [permissions.AllowAny]

    # def create(self, request, *args, **kwargs):
    #     reported_user_id = request.data.get('reported_user_id')
    #     reason = request.data.get('reason')

    #     reported_user = User.objects.get(pk=reported_user_id)
    #     reporter = request.user

    #     # Kiểm tra xem người dùng đang báo cáo là chính bản thân hay không
    #     if reported_user == reporter:
    #         return Response({'message': 'You cannot report yourself.'}, status=status.HTTP_400_BAD_REQUEST)

    #     Report.objects.create(reporter=reporter, reported_user=reported_user, reason=reason)

    #     return Response({'message': 'Report created successfully.'})


class RatingViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.ListAPIView):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    pagination_class = paginator.ItemPaginator
    permission_classes = [permissions.AllowAny]

# class LikeViewSet(viewsets.ViewSet, generics.ListAPIView):
#     queryset = Trip.objects.all()
#     serializer_class = AuthenticatedTripSerializer

    # def create(self, request, *args, **kwargs):
    #     rating_user_id = request.data.get('rating_user_id')
    #     content = request.data.get('content')
    #     trip = self.get_object().filter(active=True)
    #
    #     Rating.objects.create(rating_user_id=rating_user_id, content=content, trip=trip)
    #
    #     return Response({'message': 'Report created successfully.'})
