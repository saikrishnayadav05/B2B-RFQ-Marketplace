from uuid import UUID

from sqlalchemy.orm import Session

from app.models import Quotation, RFQ, User


def create_quotation(db: Session, supplier_id: UUID, data: dict) -> Quotation:
    quotation = Quotation(supplier_id=supplier_id, **data)
    db.add(quotation)
    db.commit()
    db.refresh(quotation)
    return quotation


def get_quotation_by_id(db: Session, quotation_id: UUID) -> Quotation | None:
    return db.query(Quotation).filter(Quotation.id == quotation_id).first()


def get_quotation_by_rfq_and_supplier(db: Session, rfq_id: UUID, supplier_id: UUID) -> Quotation | None:
    return (
        db.query(Quotation)
        .filter(Quotation.rfq_id == rfq_id, Quotation.supplier_id == supplier_id)
        .first()
    )


def get_supplier_quotations(db: Session, supplier_id: UUID) -> list[tuple[Quotation, RFQ]]:
    return (
        db.query(Quotation, RFQ)
        .join(RFQ, RFQ.id == Quotation.rfq_id)
        .filter(Quotation.supplier_id == supplier_id)
        .order_by(Quotation.created_at.desc())
        .all()
    )


def get_rfq_quotations(db: Session, rfq_id: UUID) -> list[tuple[Quotation, User]]:
    return (
        db.query(Quotation, User)
        .join(User, User.id == Quotation.supplier_id)
        .filter(Quotation.rfq_id == rfq_id)
        .order_by(Quotation.quoted_price.asc())
        .all()
    )
