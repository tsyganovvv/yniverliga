import base64
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.profile_repository import ProfileRepository
from app.repositories.user_repository import UserRepository


class ProfileService:
    def __init__(self, db: AsyncSession) -> None:
        self.repository = ProfileRepository(db)
        self.user_repository = UserRepository(db)

    @staticmethod
    def _serialize(profile, username: str) -> dict:
        return {
            "id": profile.id,
            "user_id": profile.user_id,
            "username": username,
            "image": profile.image,
            "rating": profile.rating,
            "position": profile.position,
            "created_at": profile.created_at,
            "updated_at": profile.updated_at,
        }

    async def create_profile_for_user(self, user_id: UUID):
        existing_profile = await self.repository.get_by_user_id(user_id)
        if existing_profile:
            return existing_profile
        return await self.repository.create(user_id=user_id)

    async def _refresh_rating(self, user_id: UUID) -> None:
        rating = await self.repository.calculate_rating(user_id)
        await self.repository.update_rating(user_id, rating)

    async def _get_profile_with_username(self, user_id: UUID, username: str) -> dict:
        profile = await self.repository.get_by_user_id(user_id)
        if not profile:
            profile = await self.create_profile_for_user(user_id)

        await self._refresh_rating(user_id)
        profile = await self.repository.get_by_user_id(user_id)
        if not profile:
            raise ValueError("profile not found")
        return self._serialize(profile, username)

    async def get_profile_by_user_id(self, user_id: UUID) -> dict:
        user = await self.user_repository.get_by_id(user_id)
        if not user:
            raise ValueError("user not found")
        return await self._get_profile_with_username(user.id, user.username)

    async def get_profile_by_username(self, username: str) -> dict:
        user = await self.user_repository.get_by_username(username)
        if not user:
            raise ValueError("user not found")
        return await self._get_profile_with_username(user.id, user.username)

    async def upload_photo(
        self,
        user_id: UUID,
        content: bytes,
        content_type: str,
    ) -> dict:
        user = await self.user_repository.get_by_id(user_id)
        if not user:
            raise ValueError("user not found")
        username = user.username
        if not content:
            raise ValueError("empty image")
        if len(content) > 5 * 1024 * 1024:
            raise ValueError("image too large")
        if not content_type.lower().startswith("image/"):
            raise ValueError("file must be image")

        profile = await self.repository.get_by_user_id(user_id)
        if not profile:
            profile = await self.create_profile_for_user(user_id)

        encoded = base64.b64encode(content).decode("ascii")
        image_data = f"data:{content_type};base64,{encoded}"
        updated_profile = await self.repository.update_image(user_id, image_data)
        if not updated_profile:
            raise ValueError("profile not found")

        await self._refresh_rating(user_id)
        final_profile = await self.repository.get_by_user_id(user_id)
        if not final_profile:
            raise ValueError("profile not found")
        return self._serialize(final_profile, username)
