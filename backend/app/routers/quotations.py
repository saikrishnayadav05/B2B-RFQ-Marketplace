from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_role
from app.models import User, UserRole
from app.schemas import QuotationCreate, QuotationListResponse, QuotationResponse
from app.services import marketplace_service

router = APIRouter(prefix="/quotations", tags=["quotations"])


@router.post("/", response_model=QuotationResponse, status_code=status.HTTP_201_CREATED)
def submit_quotation(
    payload: QuotationCreate,
    db: Session = Depends(get_db),
    supplier: User = Depends(require_role(UserRole.SUPPLIER)),
):
    return marketplace_service.submit_quotation(db, supplier, payload)


@router.get("/mine", response_model=QuotationListResponse)
def list_my_quotations(
    db: Session = Depends(get_db),
    supplier: User = Depends(require_role(UserRole.SUPPLIER)),
):
    return marketplace_service.list_supplier_quotations(db, supplier)


@router.get("/rfq/{rfq_id}", response_model=QuotationListResponse)
def list_rfq_quotations(
    rfq_id: UUID,
    db: Session = Depends(get_db),
    buyer: User = Depends(require_role(UserRole.BUYER)),
):
    return marketplace_service.list_rfq_quotations(db, rfq_id, buyer)
