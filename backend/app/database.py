from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import get_settings

settings = get_settings()

# Criar engine do SQLAlchemy
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Verifica conexão antes de usar
    echo=settings.DEBUG,  # Log de queries SQL em modo debug
)

# SessionLocal: cada instância será uma sessão de banco de dados
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para os models declarativos
Base = declarative_base()


def get_db():
    """
    Dependency que fornece uma sessão de banco de dados.
    Garante que a sessão seja fechada após o uso.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Inicializa o banco de dados, criando as tabelas.
    Em produção, use Alembic para migrations.
    """
    # Importar todos os models para que Base tenha conhecimento deles
    from app.models import layer  # noqa: F401
    
    Base.metadata.create_all(bind=engine)
