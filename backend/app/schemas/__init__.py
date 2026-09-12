from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models import UserRole


def _ensure_future_deadline(value: datetime) -> datetime:
    compare_to = datetime.now(timezone.utc)
    deadline = value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    if deadline <= compare_to:
        raise ValueError("Deadline must be in the future")
    return value


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=200)
    role: UserRole


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    full_name: str
    role: UserRole
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class RFQCreate(BaseModel):
    product_name: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=2000)
    quantity: int = Field(ge=1)
    delivery_location: str = Field(min_length=1, max_length=300)
    deadline: datetime

    @field_validator("deadline")
    @classmethod
    def deadline_must_be_future(cls, value: datetime) -> datetime:
        return _ensure_future_deadline(value)


class RFQUpdate(BaseModel):
    product_name: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, min_length=1, max_length=2000)
    quantity: int | None = Field(default=None, ge=1)
    delivery_location: str | None = Field(default=None, min_length=1, max_length=300)
    deadline: datetime | None = None

    @field_validator("deadline")
    @classmethod
    def deadline_must_be_future(cls, value: datetime | None) -> datetime | None:
        if value is not None:
            return _ensure_future_deadline(value)
        return value


class RFQResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    buyer_id: UUID
    product_name: str
    description: str
    quantity: int
    delivery_location: str
    deadline: datetime
    status: str
    awarded_quotation_id: UUID | None = None
    awarded_supplier_name: str | None = None
    created_at: datetime
    updated_at: datetime
    quotation_count: int = 0


class RFQFinalize(BaseModel):
    quotation_id: UUID


class RFQListResponse(BaseModel):
    items: list[RFQResponse]
    total: int
    page: int
    limit: int


class QuotationCreate(BaseModel):
    rfq_id: UUID
    quoted_price: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    estimated_delivery_days: int = Field(ge=1)
    message: str | None = Field(default=None, max_length=1000)


class QuotationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    rfq_id: UUID
    supplier_id: UUID
    quoted_price: Decimal
    estimated_delivery_days: int
    message: str | None
    created_at: datetime
    updated_at: datetime
    supplier_name: str | None = None
    rfq_product_name: str | None = None
    is_awarded: bool = False
    rfq_status: str | None = None


class QuotationListResponse(BaseModel):
    items: list[QuotationResponse]
    total: int


class ErrorResponse(BaseModel):
    detail: str
    status_code: int
