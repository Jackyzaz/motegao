from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend

import redis

redis_client = None


def init_redis_cache(settings):
    global redis_client

    print("init fastapi cache redis")
    redis_client = redis.asyncio.from_url(settings.REDIS_URL)
    FastAPICache.init(RedisBackend(redis_client), prefix="motegao-fastapi-cache")
