from sqlalchemy.orm import Session
from app.repositories.client_repository import ClientRepository
from app.schemas.client import ClientCreate, ClientUpdate
from app.core.errors import ResourceNotFoundError
from uuid import UUID

class ClientService:
    @staticmethod
    def get_client(db: Session, client_id: UUID, user_id: UUID):
        client = ClientRepository.get_for_user(db, client_id, user_id)
        if not client:
            raise ResourceNotFoundError("Client not found")
        return client

    @staticmethod
    def list_clients(db: Session, user_id: UUID):
        return ClientRepository.list_for_user(db, user_id)

    @staticmethod
    def create_client(db: Session, user_id: UUID, client_in: ClientCreate):
        return ClientRepository.create_for_user(db, user_id, client_in)

    @staticmethod
    def update_client(db: Session, client_id: UUID, user_id: UUID, client_update: ClientUpdate):
        client = ClientRepository.update_for_user(db, client_id, user_id, client_update)
        if not client:
            raise ResourceNotFoundError("Client not found")
        return client

    @staticmethod
    def delete_client(db: Session, client_id: UUID, user_id: UUID):
        success = ClientRepository.delete_for_user(db, client_id, user_id)
        if not success:
            raise ResourceNotFoundError("Client not found")
