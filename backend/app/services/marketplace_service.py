from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import Quotation, RFQ, RFQStatus, User, UserRole
from app.repositories import quotation_repository, rfq_repository, user_repository
from app.schemas import (
    QuotationCreate,
    QuotationListResponse,
    QuotationResponse,
    RFQCreate,
    RFQListResponse,
    RFQResponse,
    RFQUpdate,
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)


def register_user(db: Session, payload: UserRegister) -> UserResponse:
    existing = user_repository.get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = user_repository.create_user(
        db,
        email=payload.email,
        password=payload.password,
        full_name=payload.full_name,
        role=payload.role,
    )
    return UserResponse.model_validate(user)


def login_user(db: Session, payload: UserLogin) -> TokenResponse:
    user = user_repository.get_user_by_email(db, payload.email)
    if not user or not user_repository.verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = user_repository.create_access_token(user.id, user.role)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


def _get_awarded_supplier_name(db: Session, rfq: RFQ) -> str | None:
    if not rfq.awarded_quotation_id:
        return None
    quotation = quotation_repository.get_quotation_by_id(db, rfq.awarded_quotation_id)
    if not quotation:
        return None
    supplier = user_repository.get_user_by_id(db, quotation.supplier_id)
    return supplier.full_name if supplier else None


def _rfq_to_response(db: Session, rfq: RFQ, quotation_count: int = 0) -> RFQResponse:
    return RFQResponse(
        id=rfq.id,
        buyer_id=rfq.buyer_id,
        product_name=rfq.product_name,
        description=rfq.description,
        quantity=rfq.quantity,
        delivery_location=rfq.delivery_location,
        deadline=rfq.deadline,
        status=rfq.status.value,
        awarded_quotation_id=rfq.awarded_quotation_id,
        awarded_supplier_name=_get_awarded_supplier_name(db, rfq),
        created_at=rfq.created_at,
        updated_at=rfq.updated_at,
        quotation_count=quotation_count,
    )


def _quotation_to_response(
    quotation: Quotation,
    rfq: RFQ,
    *,
    supplier_name: str | None = None,
    rfq_product_name: str | None = None,
) -> QuotationResponse:
    return QuotationResponse(
        id=quotation.id,
        rfq_id=quotation.rfq_id,
        supplier_id=quotation.supplier_id,
        quoted_price=quotation.quoted_price,
        estimated_delivery_days=quotation.estimated_delivery_days,
        message=quotation.message,
        created_at=quotation.created_at,
        updated_at=quotation.updated_at,
        supplier_name=supplier_name,
        rfq_product_name=rfq_product_name or rfq.product_name,
        is_awarded=rfq.awarded_quotation_id == quotation.id if rfq.awarded_quotation_id else False,
        rfq_status=rfq.status.value,
    )


def create_rfq(db: Session, buyer: User, payload: RFQCreate) -> RFQResponse:
    rfq = rfq_repository.create_rfq(db, buyer.id, payload.model_dump())
    return _rfq_to_response(db, rfq)


def list_buyer_rfqs(db: Session, buyer: User) -> list[RFQResponse]:
    rfq_repository.close_expired_rfqs(db)
    rows = rfq_repository.get_buyer_rfqs(db, buyer.id)
    return [_rfq_to_response(db, rfq, count) for rfq, count in rows]


def get_rfq_detail(db: Session, rfq_id: UUID, user: User) -> RFQResponse:
    rfq_repository.close_expired_rfqs(db)
    rfq = rfq_repository.get_rfq_by_id(db, rfq_id)
    if not rfq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RFQ not found")

    if user.role == UserRole.BUYER:
        if rfq.buyer_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    elif user.role == UserRole.SUPPLIER:
        supplier_quote = quotation_repository.get_quotation_by_rfq_and_supplier(db, rfq_id, user.id)
        now = datetime.now(timezone.utc)
        is_open = rfq.status == RFQStatus.OPEN and rfq.deadline > now
        if not is_open and not supplier_quote:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RFQ not available")

    count = len(rfq.quotations)
    return _rfq_to_response(db, rfq, count)


def update_rfq(db: Session, rfq_id: UUID, buyer: User, payload: RFQUpdate) -> RFQResponse:
    rfq = rfq_repository.get_rfq_by_id(db, rfq_id)
    if not rfq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RFQ not found")
    if rfq.buyer_id != buyer.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    if rfq.status == RFQStatus.CLOSED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot edit a closed RFQ")

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

    updated = rfq_repository.update_rfq(db, rfq, update_data)
    return _rfq_to_response(db, updated, len(updated.quotations))


def delete_rfq(db: Session, rfq_id: UUID, buyer: User) -> None:
    rfq = rfq_repository.get_rfq_by_id(db, rfq_id)
    if not rfq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RFQ not found")
    if rfq.buyer_id != buyer.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    rfq_repository.delete_rfq(db, rfq)


def finalize_quotation(db: Session, rfq_id: UUID, quotation_id: UUID, buyer: User) -> RFQResponse:
    rfq = rfq_repository.get_rfq_by_id(db, rfq_id)
    if not rfq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RFQ not found")
    if rfq.buyer_id != buyer.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    if rfq.status != RFQStatus.OPEN:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="RFQ is already closed")
    if rfq.awarded_quotation_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="RFQ already has an awarded quotation")

    quotation = quotation_repository.get_quotation_by_id(db, quotation_id)
    if not quotation or quotation.rfq_id != rfq_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quotation not found for this RFQ")

    updated = rfq_repository.update_rfq(
        db,
        rfq,
        {
            "status": RFQStatus.CLOSED,
            "awarded_quotation_id": quotation_id,
        },
    )
    return _rfq_to_response(db, updated, len(updated.quotations))


def browse_rfqs(
    db: Session,
    *,
    search: str | None = None,
    location: str | None = None,
    deadline_before: datetime | None = None,
    page: int = 1,
    limit: int = 10,
) -> RFQListResponse:
    rfq_repository.close_expired_rfqs(db)
    items, total = rfq_repository.browse_rfqs(
        db,
        search=search,
        location=location,
        deadline_before=deadline_before,
        page=page,
        limit=limit,
    )
    return RFQListResponse(
        items=[_rfq_to_response(db, rfq, len(rfq.quotations)) for rfq in items],
        total=total,
        page=page,
        limit=limit,
    )


def submit_quotation(db: Session, supplier: User, payload: QuotationCreate) -> QuotationResponse:
    rfq_repository.close_expired_rfqs(db)
    rfq = rfq_repository.get_rfq_by_id(db, payload.rfq_id)
    if not rfq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RFQ not found")

    now = datetime.now(timezone.utc)
    if rfq.status != RFQStatus.OPEN or rfq.deadline <= now or rfq.awarded_quotation_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="RFQ is closed or expired")

    existing = quotation_repository.get_quotation_by_rfq_and_supplier(db, payload.rfq_id, supplier.id)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You already submitted a quotation for this RFQ")

    quotation = quotation_repository.create_quotation(
        db,
        supplier.id,
        {
            "rfq_id": payload.rfq_id,
            "quoted_price": payload.quoted_price,
            "estimated_delivery_days": payload.estimated_delivery_days,
            "message": payload.message,
        },
    )
    return _quotation_to_response(
        quotation,
        rfq,
        supplier_name=supplier.full_name,
        rfq_product_name=rfq.product_name,
    )


def list_supplier_quotations(db: Session, supplier: User) -> QuotationListResponse:
    rows = quotation_repository.get_supplier_quotations(db, supplier.id)
    items = [
        _quotation_to_response(
            quotation,
            rfq,
            supplier_name=supplier.full_name,
            rfq_product_name=rfq.product_name,
        )
        for quotation, rfq in rows
    ]
    return QuotationListResponse(items=items, total=len(items))


def list_rfq_quotations(db: Session, rfq_id: UUID, buyer: User) -> QuotationListResponse:
    rfq = rfq_repository.get_rfq_by_id(db, rfq_id)
    if not rfq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RFQ not found")
    if rfq.buyer_id != buyer.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    rows = quotation_repository.get_rfq_quotations(db, rfq_id)
    items = [
        _quotation_to_response(
            quotation,
            rfq,
            supplier_name=supplier.full_name,
            rfq_product_name=rfq.product_name,
        )
        for quotation, supplier in rows
    ]
    return QuotationListResponse(items=items, total=len(items))
