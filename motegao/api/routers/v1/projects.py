from fastapi import APIRouter, HTTPException
from .schemas import ProjectSchema
from typing import List
# ✅ Import Project มาจากที่เดียว และใช้ชื่อนี้ตลอดทั้งไฟล์
from motegao.models.projects import Project 

router = APIRouter()

@router.post("/create")
async def create_project(project: ProjectSchema):
    try:
        # ✅ ตรวจสอบว่าฟิลด์ใน project.dict() ตรงกับใน Model Project หรือไม่
        # ถ้า Frontend ส่ง 'id' มาซ้ำกับที่ MongoDB จะสร้างเอง อาจจะ Error ได้
        project_data = project.dict()
        
        new_project = Project(**project_data)
        await new_project.insert() 
        return {"status": "success", "id": new_project.id}
    except Exception as e:
        print(f"❌ CREATE ERROR: {str(e)}") # ดู Error จริงใน Terminal ของ FastAPI
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{username}", response_model=List[Project])
async def get_user_projects(username: str):
    try:
        # ✅ ค้นหาโปรเจกต์ของ User นั้นๆ
        projects = await Project.find(Project.owner == username).to_list()
        return projects
    except Exception as e:
        print(f"❌ FETCH ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/update/{project_id}")
async def update_project(project_id: str, update_data: dict):
    try:
        # ✅ ค้นหา Project ตาม id ที่ส่งมาจาก Frontend
        project = await Project.find_one(Project.id == project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # อัปเดตข้อมูล
        await project.set({
            Project.nodes: update_data.get("nodes"),
            Project.edges: update_data.get("edges"),
            Project.lastModified: update_data.get("lastModified")
        })
        return {"status": "success"}
    except Exception as e:
        print(f"❌ UPDATE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))