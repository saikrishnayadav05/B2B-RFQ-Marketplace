import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserRole(str, enum.Enum):
    BUYER = "BUYER"
    SUPPLIER = "SUPPLIER"


class RFQStatus(str, enum.Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="user_role"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    rfqs: Mapped[list["RFQ"]] = relationship(back_populates="buyer", cascade="all, delete-orphan")
    quotations: Mapped[list["Quotation"]] = relationship(back_populates="supplier", cascade="all, delete-orphan")


class RFQ(Base):
    __tablename__ = "rfqs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    buyer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    product_name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    delivery_location: Mapped[str] = mapped_column(String(300), nullable=False)
    deadline: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[RFQStatus] = mapped_column(Enum(RFQStatus, name="rfq_status"), default=RFQStatus.OPEN, nullable=False)
    awarded_quotation_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("quotations.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    buyer: Mapped["User"] = relationship(back_populates="rfqs")
    quotations: Mapped[list["Quotation"]] = relationship(
        back_populates="rfq",
        foreign_keys="Quotation.rfq_id",
        cascade="all, delete-orphan",
    )
    awarded_quotation: Mapped["Quotation | None"] = relationship(
        foreign_keys=[awarded_quotation_id],
    )


class Quotation(Base):
    __tablename__ = "quotations"
    __table_args__ = (UniqueConstraint("rfq_id", "supplier_id", name="uq_quotation_rfq_supplier"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rfq_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("rfqs.id"), nullable=False, index=True)
    supplier_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    quoted_price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    estimated_delivery_days: Mapped[int] = mapped_column(Integer, nullable=False)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    rfq: Mapped["RFQ"] = relationship(
        back_populates="quotations",
        foreign_keys=[rfq_id],
    )
    supplier: Mapped["User"] = relationship(back_populates="quotations")
