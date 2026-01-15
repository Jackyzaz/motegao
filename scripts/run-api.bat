@echo off
setlocal

set "PYTHONPATH=%PYTHONPATH%;%cd%"
set "APP_ENV=dev"

fastapi dev motegao\cmd\api.py

endlocal
