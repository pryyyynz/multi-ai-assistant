import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import uuid

from models.user import TokenData
from database.database import get_db
from database.models import User

# For JWT token generation and verification
SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY", "temporary_secret_key_change_in_production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_password_hash(password: str) -> str:
    """Hash a password for storing."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a stored password against a provided password."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT token with user ID."""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def format_user_id(user_id: Any) -> str:
    """Format UUID object to string if needed."""
    if isinstance(user_id, uuid.UUID):
        return str(user_id)
    return user_id


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get the current user from the JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise credentials_exception

        token_data = TokenData(user_id=user_id, exp=payload.get("exp"))
    except JWTError:
        raise credentials_exception

    # Retrieve user from the database
    try:
        # Convert string from token to UUID for database query
        user_id_uuid = uuid.UUID(user_id)
        user = db.query(User).filter(User.id == user_id_uuid).first()
    except (ValueError, TypeError):
        raise credentials_exception

    if user is None:
        raise credentials_exception

    return user


class UserService:
    """Service for user management operations."""

    @staticmethod
    async def create_user(email: str, username: str, password: str, db: Session) -> Dict[str, Any]:
        """Create a new user."""
        try:
            # Check if email already exists
            existing_user = db.query(User).filter(User.email == email).first()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )

            # Check if username already exists
            existing_username = db.query(User).filter(
                User.username == username).first()
            if existing_username:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )

            # Create new user entry
            new_user = User(
                email=email,
                username=username,
                hashed_password=get_password_hash(password)
            )

            # Add to database
            db.add(new_user)
            db.commit()
            db.refresh(new_user)

            # Return user data without the password
            return {
                "id": format_user_id(new_user.id),
                "email": new_user.email,
                "username": new_user.username,
                "created_at": new_user.created_at
            }

        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Database error: User could not be created. Email or username may be taken."
            )
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An error occurred: {str(e)}"
            )

    @staticmethod
    async def authenticate_user(email: str, password: str, db: Session) -> Optional[Dict[str, Any]]:
        """Authenticate a user by email and password."""
        # Find user by email
        user = db.query(User).filter(User.email == email).first()

        if not user or not verify_password(password, user.hashed_password):
            return None

        # Return user data without the password
        return {
            "id": format_user_id(user.id),
            "email": user.email,
            "username": user.username,
            "created_at": user.created_at
        }
