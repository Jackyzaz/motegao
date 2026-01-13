from gridfs.asynchronous import AsyncGridFSBucket
from beanie import PydanticObjectId
import bson


class File:

    def __init__(
        self,
        bucket_name="fs",
        chunk_size_bytes=261120,
        write_concern=None,
        read_preference=None,
        collection_name=None,
        file_id=None,
    ):

        self.bucket_name = bucket_name
        self.chunk_size_bytes = chunk_size_bytes
        self.write_concern = write_concern
        self.read_preference = read_preference
        self.collection_name = collection_name

        self.collection = self.collection_name
        if "_fs" != self.collection_name[-3:]:
            self.collection = f"{self.collection_name}_fs"

        self.db = None
        self.fs = None

        self.file_id = file_id

    async def init(self):
        from . import beanie_client

        self.db = beanie_client.db
        self.fs = AsyncGridFSBucket(
            self.db,
            bucket_name=self.bucket_name,
            chunk_size_bytes=self.chunk_size_bytes,
            write_concern=self.write_concern,
            read_preference=self.read_preference,
            collection=self.collection,
        )

    async def get_gridfs(self):
        if self.db == None or self.fs == None:
            await self.init()

        return self.fs

    async def put(self, data, metadata={}):
        fs = await self.get_gridfs()

        if "filename" not in metadata and data is not bytes:
            metadata["filename"] = data.filename

        if "content_type" not in metadata and data is not bytes:
            metadata["content_type"] = data.content_type

        if data is bytes:

            file_id = await fs.upload_from_stream(
                bson.ObjectId, data, metadata=metadata
            )
        else:
            file_id = await fs.upload_from_stream(
                data.filename, data.file, metadata=metadata
            )
        self.file_id = file_id
        return file_id

    async def get(self):
        fs = await self.get_gridfs()
        grid_out = await fs.open_download_stream(self.file_id)
        return grid_out

    async def delete(self):
        fs = await self.get_gridfs()
        await fs.delete(self.file_id)
