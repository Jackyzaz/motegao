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
    refresh_token = credentials.credentials

    jwt_handler = get_jwt_handler()
    new_token = jwt_handler.refresh_token(refresh_token)
    return {"access_token": new_token}
