from fastapi import APIRouter, Depends, HTTPException, Security, status
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBasicCredentials,
    HTTPBearer,
    OAuth2PasswordRequestForm,
)

import typing

from motegao.api.core import security, deps
from motegao.api.core.config import settings
from .... import models
from .... import schemas
import datetime

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post(
    "/token",
    summary="Get OAuth2 access token",
)
async def login_for_access_token(
    form_data: typing.Annotated[OAuth2PasswordRequestForm, Depends()],
) -> schemas.users.Token:
    user = await models.users.User.find_one(
        models.users.User.username == form_data.username
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = datetime.timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    access_token = security.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post(
    "/login",
)
async def authentication(
    form_data: typing.Annotated[OAuth2PasswordRequestForm, Depends()],
    name="auth:login",
) -> schemas.users.Token:
    user = await models.users.User.find_one(
        models.users.User.username == form_data.username
    )

    # Try to find by email if not found by username
    if not user:
        user = await models.users.User.find_one(
            models.users.User.email == form_data.username
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    if not user.verify_password(form_data.password):

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    user.last_login_date = datetime.datetime.now()
    await user.save()
    access_token_expires = datetime.timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    return schemas.users.Token(
        access_token=security.create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        ),
        refresh_token=security.create_refresh_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        ),
        token_type="Bearer",
        scope="",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires_at=datetime.datetime.now() + access_token_expires,
        issued_at=user.last_login_date,
    )


@router.get("/refresh_token")
async def refresh_token(
    credentials: typing.Annotated[HTTPAuthorizationCredentials, Security(HTTPBearer())],
):
    # TODO: Implement proper refresh token logic
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Refresh token endpoint not implemented yet",
    )


@router.post(
    "/google-login",
    summary="Google OAuth login/register",
)
async def google_oauth_login(
    google_data: schemas.users.GoogleLoginRequest,
) -> schemas.users.Token:
    """
    Handle Google OAuth login. Creates user if doesn't exist, or logs in existing user.
    """
    # Try to find user by email or google_id
    user = await models.users.User.find_one(
        models.users.User.email == google_data.email
    )

    # If user doesn't exist, create new user
    if not user:
        # Extract first and last name from Google name
        name_parts = google_data.name.split(" ", 1)
        first_name = name_parts[0] if name_parts else google_data.name
        last_name = name_parts[1] if len(name_parts) > 1 else ""

        # Generate username from email
        username = google_data.email.split("@")[0]

        # Check if username already exists, make it unique if needed
        existing_user = await models.users.User.find_one(
            models.users.User.username == username
        )
        if existing_user:
            # Add random suffix to make username unique
            import random

            username = f"{username}_{random.randint(1000, 9999)}"

        # Create new user with Google OAuth
        user = models.users.User(
            email=google_data.email,
            username=username,
            first_name=first_name,
            last_name=last_name,
            password="",  # No password for OAuth users
            roles=["user"],
            status="active",
            last_login_date=datetime.datetime.now(),
        )
        await user.save()

    # Update last login
    user.last_login_date = datetime.datetime.now()
    await user.save()

    # Generate access token
    access_token_expires = datetime.timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    return schemas.users.Token(
        access_token=security.create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        ),
        refresh_token=security.create_refresh_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        ),
        token_type="Bearer",
        scope="",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires_at=datetime.datetime.now() + access_token_expires,
        issued_at=user.last_login_date,
    )
