"""Initial migration

Revision ID: 001_initial
Revises:
Create Date: 2026-03-21
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    user_role = postgresql.ENUM("BUYER", "SUPPLIER", name="user_role", create_type=False)
    rfq_status = postgresql.ENUM("OPEN", "CLOSED", name="rfq_status", create_type=False)

    user_role.create(op.get_bind(), checkfirst=True)
    rfq_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=200), nullable=False),
        sa.Column("role", user_role, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "rfqs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("buyer_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("product_name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("delivery_location", sa.String(length=300), nullable=False),
        sa.Column("deadline", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", rfq_status, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["buyer_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_rfqs_buyer_id"), "rfqs", ["buyer_id"], unique=False)

    op.create_table(
        "quotations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("rfq_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("supplier_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("quoted_price", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("estimated_delivery_days", sa.Integer(), nullable=False),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["rfq_id"], ["rfqs.id"]),
        sa.ForeignKeyConstraint(["supplier_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("rfq_id", "supplier_id", name="uq_quotation_rfq_supplier"),
    )
    op.create_index(op.f("ix_quotations_rfq_id"), "quotations", ["rfq_id"], unique=False)
    op.create_index(op.f("ix_quotations_supplier_id"), "quotations", ["supplier_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_quotations_supplier_id"), table_name="quotations")
    op.drop_index(op.f("ix_quotations_rfq_id"), table_name="quotations")
    op.drop_table("quotations")
    op.drop_index(op.f("ix_rfqs_buyer_id"), table_name="rfqs")
    op.drop_table("rfqs")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS rfq_status")
    op.execute("DROP TYPE IF EXISTS user_role")
