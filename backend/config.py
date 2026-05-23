from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    # MongoDB
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "notetaker"
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Environment
    environment: str = "development"

    # API Key Auth
    api_key: str = Field(..., alias="API_KEY")
    api_key_header: str = "x-api-key"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
