from sqlalchemy.orm import Session
from app.models.client import Client
from app.schemas.client import ClientCreate, ClientUpdate
from uuid import UUID

class ClientRepository:
    @staticmethod
    def get_for_user(db: Session, client_id: UUID, user_id: UUID) -> Client | None:
        return db.query(Client).filter(Client.id == client_id, Client.user_id == user_id).first()

    @staticmethod
    def list_for_user(db: Session, user_id: UUID) -> list[Client]:
        return db.query(Client).filter(Client.user_id == user_id).order_by(Client.created_at.desc()).all()

    @staticmethod
    def create_for_user(db: Session, user_id: UUID, client_in: ClientCreate) -> Client:
        db_client = Client(**client_in.model_dump(), user_id=user_id)
        db.add(db_client)
        db.commit()
        db.refresh(db_client)
        return db_client

    @staticmethod
    def update_for_user(db: Session, client_id: UUID, user_id: UUID, client_update: ClientUpdate) -> Client | None:
        db_client = ClientRepository.get_for_user(db, client_id, user_id)
        if not db_client:
            return None
        
        update_data = client_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_client, key, value)
            
        db.add(db_client)
        db.commit()
        db.refresh(db_client)
        return db_client

    @staticmethod
    def delete_for_user(db: Session, client_id: UUID, user_id: UUID) -> bool:
        db_client = ClientRepository.get_for_user(db, client_id, user_id)
        if not db_client:
            return False
        
        db.delete(db_client)
        db.commit()
        return True
