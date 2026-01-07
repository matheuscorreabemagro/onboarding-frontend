from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Configurações da aplicação carregadas de variáveis de ambiente."""
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/geoapp"
    
    # Application
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    APP_NAME: str = "GeoApp API"
    APP_VERSION: str = "1.0.0"
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"
    
    # Upload
    MAX_UPLOAD_SIZE: int = 50  # MB
    UPLOAD_FOLDER: str = "/tmp/uploads"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

    @property
    def cors_origins_list(self) -> list[str]:
        """Retorna lista de origens CORS permitidas."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


@lru_cache()
def get_settings() -> Settings:
    """Retorna instância única (singleton) das configurações."""
    return Settings()
