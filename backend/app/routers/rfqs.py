from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models import User, UserRole
from app.schemas import RFQCreate, RFQFinalize, RFQListResponse, RFQResponse, RFQUpdate
from app.services import marketplace_service

router = APIRouter(prefix="/rfqs", tags=["rfqs"])


@router.post("/", response_model=RFQResponse, status_code=status.HTTP_201_CREATED)
def create_rfq(
    payload: RFQCreate,
    db: Session = Depends(get_db),
    buyer: User = Depends(require_role(UserRole.BUYER)),
):
    return marketplace_service.create_rfq(db, buyer, payload)


@router.get("/mine", response_model=list[RFQResponse])
def list_my_rfqs(
    db: Session = Depends(get_db),
    buyer: User = Depends(require_role(UserRole.BUYER)),
):
    return marketplace_service.list_buyer_rfqs(db, buyer)


@router.get("/browse", response_model=RFQListResponse)
def browse_rfqs(
    search: str | None = Query(default=None),
    location: str | None = Query(default=None),
    deadline_before: datetime | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.SUPPLIER)),
):
    return marketplace_service.browse_rfqs(
        db,
        search=search,
        location=location,
        deadline_before=deadline_before,
        page=page,
        limit=limit,
    )


@router.get("/{rfq_id}", response_model=RFQResponse)
def get_rfq(
    rfq_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return marketplace_service.get_rfq_detail(db, rfq_id, current_user)


@router.put("/{rfq_id}", response_model=RFQResponse)
def update_rfq(
    rfq_id: UUID,
    payload: RFQUpdate,
    db: Session = Depends(get_db),
    buyer: User = Depends(require_role(UserRole.BUYER)),
):
    return marketplace_service.update_rfq(db, rfq_id, buyer, payload)


@router.post("/{rfq_id}/finalize", response_model=RFQResponse)
def finalize_rfq(
    rfq_id: UUID,
    payload: RFQFinalize,
    db: Session = Depends(get_db),
    buyer: User = Depends(require_role(UserRole.BUYER)),
):
    return marketplace_service.finalize_quotation(db, rfq_id, payload.quotation_id, buyer)


@router.delete("/{rfq_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rfq(
    rfq_id: UUID,
    db: Session = Depends(get_db),
    buyer: User = Depends(require_role(UserRole.BUYER)),
):
    marketplace_service.delete_rfq(db, rfq_id, buyer)
    return None
