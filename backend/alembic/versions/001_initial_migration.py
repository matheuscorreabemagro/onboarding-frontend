"""Initial migration - create layers table

Revision ID: 001
Revises: 
Create Date: 2026-01-07 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geometry


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Habilitar extensão PostGIS
    op.execute('CREATE EXTENSION IF NOT EXISTS postgis')
    
    # Criar tabela layers
    op.create_table(
        'layers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('geometry_type', sa.String(length=50), nullable=False),
        sa.Column('geometry', Geometry(geometry_type='GEOMETRY', srid=4326, spatial_index=True), nullable=False),
        sa.Column('properties', sa.Text(), nullable=True),
        sa.Column('style', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Criar índices
    op.create_index(op.f('ix_layers_id'), 'layers', ['id'], unique=False)
    op.create_index(op.f('ix_layers_name'), 'layers', ['name'], unique=False)


def downgrade() -> None:
    # Remover índices
    op.drop_index(op.f('ix_layers_name'), table_name='layers')
    op.drop_index(op.f('ix_layers_id'), table_name='layers')
    
    # Remover tabela
    op.drop_table('layers')
