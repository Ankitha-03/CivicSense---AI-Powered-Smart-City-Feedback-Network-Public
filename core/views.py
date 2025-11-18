from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Issue
from .serializers import IssueSerializer
from civicsense_backend.ai_module.ai_classifier import IssueClassifier
from civicsense_backend.ai_module.image_analyzer import ImageAnalyzer
from civicsense_backend.ai_module.report_generator import CityHealthReportGenerator
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser

# Initialize AI modules once
try:
    classifier = IssueClassifier()
    image_analyzer = ImageAnalyzer()
    print("✅ AI modules initialized")
except Exception as e:
    print(f"❌ Error initializing AI: {e}")
    classifier = None
    image_analyzer = None


# -----------------------------------
# 🧩 USER REGISTRATION & LOGIN (JWT)
# -----------------------------------

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register new user and return JWT tokens
    """
    try:
        from .serializers import UserSerializer
        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)

            return Response({
                'message': 'User created successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)

        return Response({
            'error': 'Validation failed',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    Login with email or username and return JWT tokens
    """
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')

    if not password:
        return Response({'error': 'Password required'}, status=status.HTTP_400_BAD_REQUEST)

    user = None
    if username:
        user = authenticate(username=username, password=password)
    elif email:
        try:
            user_obj = User.objects.get(email=email)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass

    if not user:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    return Response({
        'message': 'Login successful',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
        },
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    }, status=status.HTTP_200_OK)


# -----------------------------------
# 🧩 ISSUE MANAGEMENT
# -----------------------------------

class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # ✅ handles FormData uploads

    def create(self, request, *args, **kwargs):
        """
        Create issue with AI classification
        """
        print("=== CREATE ISSUE ===")
        print("User:", request.user)
        print("Data:", request.data)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        issue = serializer.save(user=request.user)

        # Run AI classification (optional)
        if issue.image and classifier and image_analyzer:
            try:
                print("🤖 Analyzing image:", issue.image.path)
                is_good, quality_score, quality_issues = image_analyzer.analyze_image_quality(issue.image.path)
                classification = classifier.classify_image(issue.image.path)

                issue.ai_analysis = {
                    'detected_label': classification['detected_label'],
                    'confidence': classification['confidence'],
                    'image_quality': {
                        'score': quality_score,
                        'issues': quality_issues
                    }
                }
                issue.ai_category = classification['category']
                issue.ai_confidence = classification['confidence']
                issue.save()
            except Exception as e:
                print(f"❌ AI processing failed: {e}")

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def weekly_report(self, request):
        report_generator = CityHealthReportGenerator(Issue)
        report = report_generator.generate_weekly_report()
        return Response(report)
