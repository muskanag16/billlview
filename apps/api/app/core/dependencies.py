from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import uuid
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.errors import UnauthorizedError
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise UnauthorizedError("Could not validate credentials")
    except JWTError:
        raise UnauthorizedError("Could not validate credentials")
    
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise UnauthorizedError("Could not validate credentials")
        
    user = db.query(User).filter(User.id == user_uuid).first()
    if user is None:
        raise UnauthorizedError("User not found")
        
    if isinstance(user.id, str):
        user.id = uuid.UUID(user.id)
    
    return user
