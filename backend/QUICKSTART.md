# 🚀 Quick Start - GeoApp Backend

## Setup em 5 Minutos

### 1️⃣ Configurar Ambiente

```bash
# Navegar para o diretório backend
cd backend

# Copiar arquivo de ambiente
cp .env.example .env
```

### 2️⃣ Subir com Docker (Recomendado)

```bash
# Subir containers (PostgreSQL + Backend)
docker-compose up -d

# Aguardar ~30 segundos para o banco inicializar

# Executar migrations
docker-compose exec backend alembic upgrade head
```

**Pronto! ✅**
- API: http://localhost:8000
- Documentação: http://localhost:8000/docs
- Database: PostgreSQL rodando na porta 5432

### 3️⃣ Testar

```bash
# Health check
curl http://localhost:8000/health

# Ver documentação interativa
# Abra no navegador: http://localhost:8000/docs
```

### 4️⃣ Criar Primeira Camada

No navegador, acesse http://localhost:8000/docs e execute:

**POST /api/v1/layers/**
```json
{
  "name": "Minha Primeira Camada",
  "geometry": {
    "type": "Point",
    "coordinates": [-46.6333, -23.5505]
  }
}
```

### 5️⃣ Visualizar Camadas

**GET /api/v1/layers/geojson**

Copie o resultado e cole em: https://geojson.io

---

## ⚡ Comandos Úteis

```bash
# Ver logs
docker-compose logs -f

# Parar containers
docker-compose down

# Reiniciar
docker-compose restart

# Executar script de teste
python test_api.py
```

---

## 📚 Documentação Completa

- **[README.md](README.md)** - Documentação geral
- **[ONBOARDING.md](ONBOARDING.md)** - Guia de onboarding detalhado
- **[INTEGRATION.md](INTEGRATION.md)** - Integração com frontend
- **[COMMANDS.md](COMMANDS.md)** - Todos os comandos úteis
- **[SUMMARY.md](SUMMARY.md)** - Resumo da implementação

---

## 🎯 Próximos Passos

1. ✅ Testar todos os endpoints via `/docs`
2. ✅ Executar `python test_api.py`
3. ✅ Ler [ONBOARDING.md](ONBOARDING.md) para entender a arquitetura
4. ✅ Integrar com frontend usando [INTEGRATION.md](INTEGRATION.md)

---

## 🐛 Problemas?

### "Cannot connect to Docker daemon"
```bash
# Iniciar Docker Desktop (Windows/Mac)
# ou iniciar serviço Docker (Linux)
sudo systemctl start docker
```

### "Port 8000 already in use"
```bash
# Ver processo usando porta 8000
lsof -i :8000  # Linux/Mac
netstat -ano | findstr :8000  # Windows

# Matar processo
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows
```

### "Cannot connect to database"
```bash
# Verificar se banco está rodando
docker-compose ps

# Reiniciar banco
docker-compose restart db

# Ver logs do banco
docker-compose logs db
```

---

## 💡 Dicas

- Use **Swagger UI** (`/docs`) para testar interativamente
- Veja **logs em tempo real**: `docker-compose logs -f backend`
- **Acesse o banco**: `docker-compose exec db psql -U postgres -d geoapp`
- **Shell do container**: `docker-compose exec backend bash`

---

**Happy Coding! 🎉**
