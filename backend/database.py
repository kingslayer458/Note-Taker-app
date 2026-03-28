from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional ,  Any
import logging

logger = logging.getLogger(__name__)


class Database:
   client: Optional[Any] = None
    
    
db = Database()


async def connect_to_mongo(mongodb_url: str, database_name: str):
    """Connect to MongoDB"""
    try:
        db.client = AsyncIOMotorClient(mongodb_url)
        # Verify connection
        await db.client.admin.command('ping')
        logger.info(f"Connected to MongoDB: {database_name}")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise e


async def close_mongo_connection():
    """Close MongoDB connection"""
    if db.client:
        db.client.close()
        logger.info("Closed MongoDB connection")


def get_database(database_name: str):
    """Get database instance"""
    if db.client is None:
        raise Exception("Database not connected")
    return db.client[database_name]


def get_notes_collection(database_name: str):
    """Get notes collection"""
    return get_database(database_name)["notes"]
