from fastapi import APIRouter, HTTPException, Depends
from .schemas import ProjectSchema, ProjectCreateSchema, ProjectRenameSchema
from typing import List
from beanie import PydanticObjectId
import datetime

# ✅ Import Project มาจากที่เดียว และใช้ชื่อนี้ตลอดทั้งไฟล์
from motegao.models.projects import Project
from motegao.api.core import deps
from motegao import models

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("/create")
async def create_project(
    project: ProjectCreateSchema,
    current_user: models.users.User = Depends(deps.get_current_user),
):
    try:
        # Create new project with authenticated user as owner
        new_project = Project(
            name=project.name,
            owner=current_user.id,  # Set owner from authenticated user
            nodes=project.nodes,
            edges=project.edges,
        )
        await new_project.insert()
        return {"status": "success", "id": str(new_project.id)}
    except Exception as e:
        print(f"❌ CREATE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/my-projects", response_model=List[Project])
async def get_my_projects(
    current_user: models.users.User = Depends(deps.get_current_user),
):
    try:
        # Return only projects owned by the authenticated user
        projects = await Project.find(Project.owner == current_user.id).to_list()
        return projects
    except Exception as e:
        print(f"❌ FETCH ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/detail/{project_id}")
async def get_project_detail(
    project_id: str,
    current_user: models.users.User = Depends(deps.get_current_user),
):
    try:
        # Find project and verify ownership
        project = await Project.find_one(Project.id == PydanticObjectId(project_id))
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Verify user owns this project
        if project.owner != current_user.id:
            raise HTTPException(
                status_code=403, detail="Not authorized to access this project"
            )

        return project
    except Exception as e:
        print(f"❌ DETAIL ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/update/{project_id}")
async def update_project(
    project_id: str,
    update_data: dict,
    current_user: models.users.User = Depends(deps.get_current_user),
):
    try:
        # Find project and verify ownership
        project = await Project.find_one(Project.id == PydanticObjectId(project_id))
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Verify user owns this project
        if project.owner != current_user.id:
            raise HTTPException(
                status_code=403, detail="Not authorized to update this project"
            )

        # Update project data
        await project.set(
            {
                Project.nodes: update_data.get("nodes"),
                Project.edges: update_data.get("edges"),
                Project.lastModified: update_data.get("lastModified"),
            }
        )
        return {"status": "success"}
    except Exception as e:
        print(f"❌ UPDATE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/rename/{project_id}")
async def rename_project(
    project_id: str,
    rename_data: ProjectRenameSchema,
    current_user: models.users.User = Depends(deps.get_current_user),
):
    try:
        # Find project and verify ownership
        project = await Project.find_one(Project.id == PydanticObjectId(project_id))
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Verify user owns this project
        if project.owner != current_user.id:
            raise HTTPException(
                status_code=403, detail="Not authorized to rename this project"
            )

        # Update project name and lastModified
        await project.set(
            {
                Project.name: rename_data.name,
                Project.lastModified: datetime.datetime.now(),
            }
        )
        return {"status": "success", "message": "Project renamed successfully"}
    except Exception as e:
        print(f"❌ RENAME ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete/{project_id}")
async def delete_project(
    project_id: str,
    current_user: models.users.User = Depends(deps.get_current_user),
):
    try:
        # Find project and verify ownership
        project = await Project.find_one(Project.id == PydanticObjectId(project_id))
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Verify user owns this project
        if project.owner != current_user.id:
            raise HTTPException(
                status_code=403, detail="Not authorized to delete this project"
            )

        # Delete the project
        await project.delete()
        return {"status": "success", "message": "Project deleted successfully"}
    except Exception as e:
        print(f"❌ DELETE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
