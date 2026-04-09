# routers/fabrics.py — Fabric catalogue CRUD
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.database import get_db
from app.models.fabric import Fabric
from app.schemas.fabric import FabricCreate, FabricUpdate, FabricOut
from app.middleware.auth import require_admin

router = APIRouter()


@router.get("/", response_model=List[FabricOut])
def list_fabrics(fabric_type: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Fabric)
    if fabric_type:
        query = query.filter(Fabric.fabric_type == fabric_type)
    return query.order_by(Fabric.name).all()


@router.post("/", response_model=FabricOut, status_code=201)
def create_fabric(data: FabricCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    fabric = Fabric(id=str(uuid.uuid4()), **data.model_dump())
    db.add(fabric)
    db.commit()
    db.refresh(fabric)
    return fabric


@router.put("/{fabric_id}", response_model=FabricOut)
def update_fabric(fabric_id: str, data: FabricUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    fabric = db.query(Fabric).filter(Fabric.id == fabric_id).first()
    if not fabric:
        raise HTTPException(status_code=404, detail="Not found")
    for key, val in data.model_dump(exclude_none=True).items():
        setattr(fabric, key, val)
    db.commit()
    db.refresh(fabric)
    return fabric


@router.delete("/{fabric_id}")
def delete_fabric(fabric_id: str, db: Session = Depends(get_db), _=Depends(require_admin)):
    fabric = db.query(Fabric).filter(Fabric.id == fabric_id).first()
    if not fabric:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(fabric)
    db.commit()
    return {"message": "Deleted"}
