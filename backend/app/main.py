from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import get_settings
from app.database import init_db
from app.routes import layer
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

settings = get_settings()

# Criar aplicação FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API para gerenciamento de camadas geoespaciais",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Executado na inicialização da aplicação."""
    logger.info("Iniciando aplicação...")
    # Inicializar banco de dados (em produção, use Alembic)
    # init_db()  # Comentado - usar Alembic migrations
    logger.info("Aplicação iniciada com sucesso!")


@app.on_event("shutdown")
async def shutdown_event():
    """Executado no desligamento da aplicação."""
    logger.info("Desligando aplicação...")


@app.get("/")
async def root():
    """Endpoint raiz da API."""
    return {
        "message": "GeoApp API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Endpoint para verificação de saúde da aplicação."""
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "environment": settings.APP_ENV,
        }
    )


# Incluir routers
app.include_router(
    layer.router,
    prefix=f"{settings.API_V1_PREFIX}/layers",
    tags=["layers"]
)
