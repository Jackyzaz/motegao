from fastapi import APIRouter, Depends, HTTPException, Request, status
from .... import schemas, models
from motegao.api.core import deps
from loguru import logger
from beanie.operators import Set
from beanie import PydanticObjectId
import datetime


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model_by_alias=False, response_model=schemas.users.User)
def get_me(current_user: models.users.User = Depends(deps.get_current_user)):
    return current_user


@router.get(
    "/me/check_password",
    response_model_by_alias=False,
    response_model=bool,
)
async def get_me_check_password(
    current_user: models.users.User = Depends(deps.get_current_user),
):
    return current_user.is_use_citizen_id_as_password()


@router.get(
    "/{user_id}",
    # response_model_by_alias=False,
    # response_model=schemas.users.User,
)
async def get(
    user_id: PydanticObjectId,
    current_user: models.users.User = Depends(deps.get_current_user),
) -> schemas.users.User:
    try:
        user = await models.User.find_one(
            models.User.id == user_id,
            fetch_links=True,
        )
        # logger.debug(user)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found this user",
        )
    return user


@router.get(
    "",
    response_model_by_alias=False,
)
async def get_all(
    email: str = "",
    username: str = "",
    current_page: int = 1,
    limit: int = 50,
    current_user: models.users.User = Depends(deps.get_current_user),
) -> schemas.users.UserList:
    users = models.users.User.find(models.users.User.status == "active")
    count = 0

    if email:
        users = users.find(models.users.User.email == email)

    if username:
        users = users.find(models.users.User.username == username)

    count = await users.count()
    users = users.skip((current_page - 1) * limit).limit(limit)

    if count % limit == 0 and count // limit > 0:
        total_page = count // limit
    else:
        total_page = (count // limit) + 1

    users = await users.to_list()
    return schemas.users.UserList(
        users=list(users),
        count=count,
        current_page=current_page,
        total_page=total_page,
    )


# router.post(
#    "/create",
#    # response_model=schemas.users.User,
#    response_model_by_alias=False,
# )
# async def create(
#    user_register: schemas.users.RegisteredUser,
# ) -> schemas.users.User:
#    user = await models.users.User.find_one(
#        models.users.User.username == user_register.username
#    )
#
#    if user:
#        raise HTTPException(
#            status_code=status.HTTP_409_CONFLICT,
#            detail="This username is exists.",
#        )
#
#    user = models.users.User(**user_register.dict())
#    await user.set_password(user_register.password)
#    await user.insert()
#
#   return user

# @router.post(
#     "/create",
#     # response_model=schemas.users.User, # บรรทัดนี้อาจจะเปิดหรือปิดไว้ก่อนก็ได้ถ้า schema ยังไม่เป๊ะ
#     response_model_by_alias=False,
# )
# async def create(
#     user_register: schemas.users.RegisteredUser,
# ) -> typing.Any: # เปลี่ยน return type เป็น Any ชั่วคราวถ้า schemas.users.User มีปัญหา
#     # เช็คว่ามี username นี้ใน MongoDB หรือยัง
#     user = await models.users.User.find_one(
#         models.users.User.username == user_register.username
#     )

#     if user:
#         raise HTTPException(
#             status_code=status.HTTP_409_CONFLICT,
#             detail="This username already exists.",
#         )

#     # สร้าง User ใหม่
#     user = models.users.User(**user_register.dict())
#     await user.set_password(user_register.password) # เข้ารหัสรหัสผ่าน
#     await user.insert() # บันทึกลง MongoDB

#     return user

@router.put(
    "/{user_id}/change_password",
    response_model=schemas.users.User,
    response_model_by_alias=False,
)
def change_password(
    user_id: str,
    password_update: schemas.users.ChangedPassword,
    current_user: models.users.User = Depends(deps.get_current_user),
):
    try:
        user = models.users.User.objects.get(id=user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found this user",
        )
    # if not user.verify_password(password_update.current_password):
    #     raise HTTPException(
    #         status_code=status.HTTP_401_UNAUTHORIZED,
    #         detail="Incorrect password",
    #     )

    user.set_password(password_update.new_password)
    user.save()
    return user


@router.put(
    "/{user_id}/update",
    response_model=schemas.users.User,
    response_model_by_alias=False,
)
def update(
    request: Request,
    user_id: str,
    user_update: schemas.users.UpdatedUser,
    current_user: models.users.User = Depends(deps.get_current_user),
):
    try:
        user = models.users.User.objects.get(id=user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found this user",
        )

    set_dict = {f"set__{k}": v for k, v in user_update.dict().items() if v is not None}

    user.update(**set_dict)

    user.reload()
    # request_log = deps.create_logs(
    #     action="update", request=request, current_user=current_user
    # )
    # user.request_logs.append(request_log)
    if user.citizen_id:
        user.citizen_id = user.citizen_id.replace("-", "")
    user.save()
    return user


@router.put(
    "/{user_id}/set_status",
    response_model=schemas.users.User,
    response_model_by_alias=False,
)
async def set_status(
    user_id: PydanticObjectId,
    status: str = "active",
    current_user: models.users.User = Depends(deps.get_current_user),
):
    try:
        user = await models.User.find_one(
            models.User.id == user_id,
            fetch_links=True,
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found this user",
        )
    user.status = status
    # logger.debug(user)
    await user.update(Set(user))
    user.updated_date = datetime.datetime.now()
    await user.save()

    return user


@router.put(
    "/{user_id}/set_role",
)
async def set_role(
    user_id: PydanticObjectId,
    role: str,
    action: str,
    current_user: models.users.User = Depends(deps.get_current_user),
) -> schemas.users.User:
    try:
        user = await models.User.find_one(
            models.User.id == user_id,
            fetch_links=True,
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found this user",
        )
    data = user.roles

    if action == "add":
        data.append(role)
    elif action == "remove":
        data.remove(role)

    # logger.debug(user)
    await user.update(Set(user))
    user.updated_date = datetime.datetime.now()
    await user.save()

    return user
