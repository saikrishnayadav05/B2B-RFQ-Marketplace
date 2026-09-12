from datetime import datetime, timezone
import re
from uuid import UUID

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models import Quotation, RFQ, RFQStatus, User


def _location_filter_patterns(location: str) -> list[str]:
    term = location.strip()
    if not term:
        return []

    patterns = {f"%{term}%"}

    for token in re.split(r"[,\s]+", term):
        if len(token) >= 2:
            patterns.add(f"%{token}%")
            if len(token) >= 3:
                patterns.add(f"%{token[:3]}%")
            if len(token) >= 4:
                patterns.add(f"%{token[:4]}%")
            if len(token) >= 5:
                patterns.add(f"%{token[:5]}%")

    return list(patterns)


def create_rfq(db: Session, buyer_id: UUID, data: dict) -> RFQ:
    rfq = RFQ(buyer_id=buyer_id, **data)
    db.add(rfq)
    db.commit()
    db.refresh(rfq)
    return rfq


def get_rfq_by_id(db: Session, rfq_id: UUID) -> RFQ | None:
    return db.query(RFQ).filter(RFQ.id == rfq_id).first()


def get_buyer_rfqs(db: Session, buyer_id: UUID) -> list[tuple[RFQ, int]]:
    rows = (
        db.query(RFQ, func.count(Quotation.id).label("quotation_count"))
        .outerjoin(Quotation, Quotation.rfq_id == RFQ.id)
        .filter(RFQ.buyer_id == buyer_id)
        .group_by(RFQ.id)
        .order_by(RFQ.created_at.desc())
        .all()
    )
    return rows


def update_rfq(db: Session, rfq: RFQ, data: dict) -> RFQ:
    for key, value in data.items():
        if value is not None:
            setattr(rfq, key, value)
    db.commit()
    db.refresh(rfq)
    return rfq


def delete_rfq(db: Session, rfq: RFQ) -> None:
    db.delete(rfq)
    db.commit()


def browse_rfqs(
    db: Session,
    *,
    search: str | None = None,
    location: str | None = None,
    deadline_before: datetime | None = None,
    page: int = 1,
    limit: int = 10,
) -> tuple[list[RFQ], int]:
    now = datetime.now(timezone.utc)
    query = db.query(RFQ).filter(
        RFQ.status == RFQStatus.OPEN,
        RFQ.deadline > now,
    )

    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                RFQ.product_name.ilike(pattern),
                RFQ.description.ilike(pattern),
                RFQ.delivery_location.ilike(pattern),
            )
        )

    if location:
        location_patterns = _location_filter_patterns(location)
        if location_patterns:
            query = query.filter(or_(*[RFQ.delivery_location.ilike(pattern) for pattern in location_patterns]))

    if deadline_before:
        query = query.filter(RFQ.deadline <= deadline_before)

    total = query.count()
    items = query.order_by(RFQ.deadline.asc()).offset((page - 1) * limit).limit(limit).all()
    return items, total


def close_expired_rfqs(db: Session) -> None:
    now = datetime.now(timezone.utc)
    db.query(RFQ).filter(
        RFQ.status == RFQStatus.OPEN,
        RFQ.deadline <= now,
        RFQ.awarded_quotation_id.is_(None),
    ).update(
        {RFQ.status: RFQStatus.CLOSED},
        synchronize_session=False,
    )
    db.commit()
