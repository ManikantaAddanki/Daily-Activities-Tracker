from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Profile

class UserRegistrationSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(max_length=150, required=True, write_only=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'full_name', 'password', 'confirm_password')
        extra_kwargs = {
            'email': {'required': True},
        }

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        return value.lower()

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        full_name = validated_data.pop('full_name')
        validated_data.pop('confirm_password')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        
        # Profile is created via post_save signal; update full_name
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.full_name = full_name
        profile.save()
        return user

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('full_name', 'profile_image', 'bio', 'daily_activity_target', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'profile')
        read_only_fields = ('id', 'date_joined')

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(max_length=150, required=False)
    bio = serializers.CharField(required=False, allow_blank=True)
    daily_activity_target = serializers.IntegerField(required=False, min_value=1, max_value=50)

    class Meta:
        model = User
        fields = ('email', 'full_name', 'bio', 'daily_activity_target')

    def update(self, instance, validated_data):
        email = validated_data.get('email')
        if email and email != instance.email:
            if User.objects.filter(email__iexact=email).exclude(pk=instance.pk).exists():
                raise serializers.ValidationError({"email": "This email is already in use."})
            instance.email = email.lower()
            instance.save()

        profile, _ = Profile.objects.get_or_create(user=instance)
        if 'full_name' in validated_data:
            profile.full_name = validated_data['full_name']
        if 'bio' in validated_data:
            profile.bio = validated_data['bio']
        if 'daily_activity_target' in validated_data:
            profile.daily_activity_target = validated_data['daily_activity_target']
        profile.save()
        return instance

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_new_password = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_new_password']:
            raise serializers.ValidationError({"confirm_new_password": "New passwords do not match."})
        return attrs
