"""Add awarded_quotation_id to rfqs

Revision ID: 002_awarded_quotation
Revises: 001_initial
Create Date: 2026-03-21
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "002_awarded_quotation"
down_revision: Union[str, None] = "001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "rfqs",
        sa.Column("awarded_quotation_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_foreign_key(
        "fk_rfqs_awarded_quotation_id",
        "rfqs",
        "quotations",
        ["awarded_quotation_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint("fk_rfqs_awarded_quotation_id", "rfqs", type_="foreignkey")
    op.drop_column("rfqs", "awarded_quotation_id")
