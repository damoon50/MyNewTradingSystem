@echo off
setlocal

title myTradingSystem Backend

set "SCRIPT_DIR=%~dp0"
set "BACKEND_DIR=%SCRIPT_DIR%backend\tradingSystem"

if not exist "%BACKEND_DIR%\gradlew.bat" (
  echo [ERROR] gradlew.bat not found:
  echo %BACKEND_DIR%
  goto end
)

pushd "%BACKEND_DIR%"
if errorlevel 1 (
  echo [ERROR] Cannot enter backend directory.
  goto end
)

if exist "D:\java_jdk17\bin\java.exe" (
  set "JAVA_HOME=D:\java_jdk17"
  set "PATH=%JAVA_HOME%\bin;%PATH%"
) else (
  where java >nul 2>nul
  if errorlevel 1 (
    echo [ERROR] Java not found. Please install/configure JDK 17.
    popd
    goto end
  )
)

echo [INFO] Releasing port 16666 if occupied...
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":16666" ^| findstr "LISTENING"') do (
  if not "%%P"=="0" (
    echo [INFO] Killing PID %%P
    taskkill /PID %%P /F >nul 2>nul
  )
)

echo [INFO] Building backend jar...
call ".\gradlew.bat" --no-daemon clean bootJar -x test
if errorlevel 1 (
  set "EXIT_CODE=%ERRORLEVEL%"
  popd
  echo.
  echo [ERROR] Build failed with code %EXIT_CODE%.
  goto end
)

echo [INFO] Starting backend in background...
start "myTradingSystem-backend" /b cmd /c "java -jar build\libs\tradingSystem-0.0.1-SNAPSHOT.jar > backend.log 2>&1"
popd

echo [OK] Backend start command sent.
echo [OK] URL: http://127.0.0.1:16666
echo [OK] Log: %BACKEND_DIR%\backend.log
echo [OK] Stop command: for /f "tokens=5" %%P in ^('netstat -ano ^| findstr ":16666" ^| findstr "LISTENING"'^) do taskkill /PID %%P /F

:end
echo.
pause
