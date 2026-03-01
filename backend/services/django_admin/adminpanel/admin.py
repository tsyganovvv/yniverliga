from django.contrib import admin

from adminpanel.models import AuthSession, Department, Rewiew, Topic, User


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active", "created_at", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("name", "description")
    ordering = ("name",)
    readonly_fields = ("id", "created_at", "updated_at")


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        "username",
        "fullname",
        "role",
        "gender",
        "department",
        "is_active",
        "created_at",
    )
    list_filter = ("role", "gender", "is_active", "department")
    search_fields = ("username", "fullname")
    ordering = ("username",)
    autocomplete_fields = ("department",)
    readonly_fields = ("id", "created_at", "updated_at")


@admin.register(AuthSession)
class AuthSessionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "expires_at", "created_at")
    list_filter = ("expires_at",)
    search_fields = ("user__username", "token_hash")
    ordering = ("-expires_at",)
    autocomplete_fields = ("user",)
    readonly_fields = ("id", "created_at", "updated_at")


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "is_positive",
        "is_active",
        "categories_preview",
        "updated_at",
    )
    list_filter = ("is_positive", "is_active")
    search_fields = ("name",)
    ordering = ("name",)
    readonly_fields = ("id", "created_at", "updated_at")

    @admin.display(description="categories")
    def categories_preview(self, obj: Topic) -> str:
        return ", ".join(obj.categories)


@admin.register(Rewiew)
class RewiewAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "from_user",
        "to_user",
        "topic",
        "category",
        "is_positive",
        "rate",
        "created_at",
    )
    list_filter = ("is_positive", "rate", "category")
    search_fields = ("topic", "category", "from_user__username", "to_user__username")
    ordering = ("-created_at",)
    list_select_related = ("from_user", "to_user")
    autocomplete_fields = ("from_user", "to_user")
    readonly_fields = ("id", "created_at", "updated_at")
