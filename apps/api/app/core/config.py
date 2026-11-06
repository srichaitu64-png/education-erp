from typing import List, Optional, Union
from pydantic import ValidationInfo, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    APP_NAME: str = "Enterprise Education ERP SaaS"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "change-this-to-a-secure-random-256-bit-key-in-production"
    INITIAL_SUPERADMIN_PASSWORD: Optional[str] = None
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database URLs (Strictly non-superuser, NOBYPASSRLS application role)
    DATABASE_URL: str = "postgresql+asyncpg://erp_app:erp_app_pass@127.0.0.1:5433/education_erp_dev"
    SYNC_DATABASE_URL: str = "postgresql+psycopg2://erp_app:erp_app_pass@127.0.0.1:5433/education_erp_dev"
    TEST_DATABASE_URL: str = "postgresql+asyncpg://erp_app:erp_app_pass@127.0.0.1:5433/education_erp_test"
    TEST_ADMIN_DATABASE_URL: Optional[str] = None

    # Domain routing
    BASE_DOMAIN: str = "erp.local"
    SUPERADMIN_SUBDOMAIN: str = "admin"
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://education-erp-nine.vercel.app",
    ]

    # Redis
    REDIS_URL: Optional[str] = "redis://127.0.0.1:6379/0"

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str, info: ValidationInfo) -> str:
        env = info.data.get("ENVIRONMENT", "development")
        if env == "production":
            if (
                len(v) < 32
                or any(marker in v.lower() for marker in ("change-this", "replace_with", "placeholder", "example"))
                or v in ("secret", "password", "default")
            ):
                raise ValueError(
                    "Insecure SECRET_KEY: In production, SECRET_KEY must be a cryptographically secure string of at least 32 characters and cannot use placeholder values."
                )
        return v

    @field_validator("INITIAL_SUPERADMIN_PASSWORD")
    @classmethod
    def validate_initial_superadmin_password(cls, v: Optional[str]) -> Optional[str]:
        if v:
            if len(v) < 14:
                raise ValueError("INITIAL_SUPERADMIN_PASSWORD must be at least 14 characters.")
            if v.strip() != v:
                raise ValueError("INITIAL_SUPERADMIN_PASSWORD must not contain leading or trailing whitespace.")
        return v or None

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
