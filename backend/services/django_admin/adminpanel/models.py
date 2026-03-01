import uuid

from django.db import models


class TimeStampedUUIDModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        abstract = True


class Department(TimeStampedUUIDModel):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = "departments"

    def __str__(self) -> str:
        return self.name


class User(TimeStampedUUIDModel):
    ROLE_EMPLOYEE = "EMPLOYEE"
    ROLE_ADMIN = "ADMIN"
    ROLE_ROOT = "ROOT"
    ROLE_CHOICES = (
        (ROLE_EMPLOYEE, ROLE_EMPLOYEE),
        (ROLE_ADMIN, ROLE_ADMIN),
        (ROLE_ROOT, ROLE_ROOT),
    )

    GENDER_NOT_SPECIFIED = "NOT_SPECIFIED"
    GENDER_MALE = "MALE"
    GENDER_FEMALE = "FEMALE"
    GENDER_CHOICES = (
        (GENDER_NOT_SPECIFIED, GENDER_NOT_SPECIFIED),
        (GENDER_MALE, GENDER_MALE),
        (GENDER_FEMALE, GENDER_FEMALE),
    )

    username = models.CharField(max_length=100, unique=True)
    hashed_password = models.CharField(max_length=255)
    fullname = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_EMPLOYEE)
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        db_column="department_id",
        related_name="users",
        blank=True,
        null=True,
    )
    gender = models.CharField(
        max_length=20,
        choices=GENDER_CHOICES,
        default=GENDER_NOT_SPECIFIED,
    )
    birth_date = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = "users"

    def __str__(self) -> str:
        return self.username


class AuthSession(TimeStampedUUIDModel):
    token_hash = models.CharField(max_length=255)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        db_column="user_id",
        related_name="auth_sessions",
    )
    expires_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "sessions"
        verbose_name = "Auth session"
        verbose_name_plural = "Auth sessions"

    def __str__(self) -> str:
        return f"{self.user.username} ({self.expires_at})"


class Topic(TimeStampedUUIDModel):
    name = models.CharField(max_length=255)
    categories = models.JSONField(default=list)
    is_positive = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = "topics"
        unique_together = (("name", "is_positive"),)

    def __str__(self) -> str:
        polarity = "positive" if self.is_positive else "negative"
        return f"{self.name} ({polarity})"


class Rewiew(TimeStampedUUIDModel):
    to_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        db_column="to_user_id",
        related_name="received_rewiews",
        blank=True,
        null=True,
    )
    from_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        db_column="from_user_id",
        related_name="sent_rewiews",
        blank=True,
        null=True,
    )
    topic = models.CharField(max_length=255)
    category = models.CharField(max_length=255)
    is_positive = models.BooleanField(default=True)
    rate = models.SmallIntegerField()

    class Meta:
        managed = False
        db_table = "rewiews"

    def __str__(self) -> str:
        return f"{self.topic}: {self.rate}"
