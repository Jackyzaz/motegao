from fastapi import APIRouter, HTTPException
from .schemas import ProjectSchema # import จากไฟล์ข้างๆ
# ตรงนี้ให้ดูใน users.py ว่าเขา import ตัวแปรที่ใช้ต่อ MongoDB มายังไง
# เช่น from app.core.database import db

router = APIRouter()

@router.post("/create")
async def create_project(project: ProjectSchema):
    try:
        # 📥 บันทึกลง Collection ชื่อ "projects"
        # await db.projects.insert_one(project.dict()) 
        return {"status": "success", "id": project.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{username}")
async def get_user_projects(username: str):
    try:
        # 🔍 ค้นหาเฉพาะอันที่เจ้าของ (owner) ตรงกับ username ที่ส่งมา
        # cursor = db.projects.find({"owner": username})
        # projects = await cursor.to_list(length=100)
        
        # จัดการเรื่อง _id (ถ้าใช้ MongoDB)
        # for p in projects: p.pop("_id", None)
        
        return [] # คืนค่าเป็น List เปล่าไปก่อนในช่วงทดสอบ
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.put("/update/{project_id}")
async def update_project(project_id: str, update_data: dict):
    # อัปเดตข้อมูลใน MongoDB โดยค้นหาจากฟิลด์ id (ไม่ใช่ _id)
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {
            "nodes": update_data.get("nodes"),
            "edges": update_data.get("edges"),
            "lastModified": update_data.get("lastModified")
        }}
    )
    return {"status": "success"}