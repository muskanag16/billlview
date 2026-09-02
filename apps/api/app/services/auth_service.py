from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.errors import ResourceAlreadyExistsError, InvalidCredentialsError

class AuthService:
    @staticmethod
    def register_user(db: Session, user_in: UserCreate) -> User:
        user = db.query(User).filter(User.email == user_in.email).first()
        if user:
            raise ResourceAlreadyExistsError("A user with this email already exists.")
        
        db_user = User(
            email=user_in.email,
            password_hash=get_password_hash(user_in.password)
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def authenticate_user(db: Session, user_in: UserLogin):
        user = db.query(User).filter(User.email == user_in.email).first()
        if not user or not verify_password(user_in.password, user.password_hash):
            raise InvalidCredentialsError()
        
        access_token = create_access_token(subject=user.id)
        return {"access_token": access_token, "token_type": "bearer"}
