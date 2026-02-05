import sys
import os
from dotenv import load_dotenv

# Add the project root directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Load environment variables from .env file
load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env")))

from motegao import models
import asyncio


async def create_user_admin():
    class Setting:
        def __init__(self):
            self.MONGODB_URI = "mongodb://localhost/motegaodb"

    settings = Setting()
    if len(sys.argv) > 1:
        # Construct the MongoDB URI with authentication for production/docker environment
        username = os.environ.get("MONGO_ROOT_USERNAME", "admin")
        password = os.environ.get("MONGO_ROOT_PASSWORD")
        settings.MONGODB_URI = (
            f"mongodb://{username}:{password}@mongodb:27017/motegaodb?authSource=admin"
        )
    await models.init_beanie(None, settings)
    print("Initialized Beanie")

    print("start check admin")
    user = await models.users.User.find_one(models.users.User.username == "admin")

    if user:
        print("Found admin user", user)
        return
    print("end check admin")

    print("start create admin")
    user = models.users.User(
        email="admin@example.com",
        username="admin",
        password="",
        first_name="admin",
        last_name="system",
        roles=["user", "admin"],
        status="active",
    )
    # Set password form .env
    print("os.environ", os.environ.get("ADMIN_PASSWORD"))
    user.set_password(os.environ.get("ADMIN_PASSWORD"))
    await user.save()
    print("finish")


if __name__ == "__main__":
    print("Initialize admin user")
    asyncio.run(create_user_admin())
