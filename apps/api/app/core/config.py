from typing import List, Optional
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    APP_NAME: str = "Enterprise Education ERP SaaS"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "change-this-to-a-secure-random-256-bit-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database URLs
    DATABASE_URL: str = "postgresql+asyncpg://postgres@127.0.0.1:5433/education_erp_dev"
    SYNC_DATABASE_URL: str = "postgresql+psycopg2://postgres@127.0.0.1:5433/education_erp_dev"
    TEST_DATABASE_URL: str = "postgresql+asyncpg://postgres@127.0.0.1:5433/education_erp_test"

    # Domain routing
    BASE_DOMAIN: str = "erp.local"
    SUPERADMIN_SUBDOMAIN: str = "admin"
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # Redis
    REDIS_URL: Optional[str] = "redis://127.0.0.1:6379/0"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
