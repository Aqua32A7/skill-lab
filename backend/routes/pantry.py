from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from database import get_db
from models.pantry import PantryItem
from schemas.pantry import PantryItemCreate, PantryItemUpdate, PantryItemResponse

router = APIRouter(prefix="/api/pantry", tags=["pantry"])

@router.get("", response_model=List[PantryItemResponse])
def get_pantry_items(
    q: Optional[str] = Query(None, description="Search query by name or category"),
    db: Session = Depends(get_db)
):
    query = db.query(PantryItem)
    if q and q.strip():
        search = f"%{q.strip()}%"
        query = query.filter(or_(PantryItem.name.ilike(search), PantryItem.category.ilike(search)))
    return query.order_by(PantryItem.category.asc(), PantryItem.name.asc()).all()

@router.post("", response_model=PantryItemResponse, status_code=201)
def add_pantry_item(item: PantryItemCreate, db: Session = Depends(get_db)):
    # Check if duplicate exists with same name (case-insensitive)
    existing = db.query(PantryItem).filter(PantryItem.name.ilike(item.name.strip())).first()
    if existing:
        # Update existing quantity or category
        if item.quantity:
            existing.quantity = item.quantity
        if item.unit:
            existing.unit = item.unit
        if item.category:
            existing.category = item.category
        db.commit()
        db.refresh(existing)
        return existing

    new_item = PantryItem(
        name=item.name.strip(),
        quantity=item.quantity,
        unit=item.unit,
        category=item.category or "General"
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.put("/{item_id}", response_model=PantryItemResponse)
def update_pantry_item(item_id: int, item_update: PantryItemUpdate, db: Session = Depends(get_db)):
    item = db.query(PantryItem).filter(PantryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Pantry item not found")

    if item_update.name is not None:
        item.name = item_update.name.strip()
    if item_update.quantity is not None:
        item.quantity = item_update.quantity
    if item_update.unit is not None:
        item.unit = item_update.unit
    if item_update.category is not None:
        item.category = item_update.category

    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}", status_code=204)
def delete_pantry_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(PantryItem).filter(PantryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Pantry item not found")
    db.delete(item)
    db.commit()
    return None
