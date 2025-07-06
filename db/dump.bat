@echo off
REM ------------------------------------------------------------
REM PostgreSQL database dump helper (UTF-8 aware)
REM ------------------------------------------------------------

REM 1) Force the console to use UTF-8 so messages don’t get garbled.
chcp 65001 > nul

REM 2) Isolate environment changes.
setlocal

REM ---------- Configuration ----------
REM Read from environment variables if defined, otherwise use defaults.
set "DB_HOST=%PGHOST%"
set "DB_PORT=%PGPORT%"
set "DB_USER=%PGUSER%"
set "DB_NAME=%PGDATABASE%"
set "PG_BIN_DIR=%PGBINDIR%"

if not defined DB_HOST set "DB_HOST=localhost"
if not defined DB_PORT set "DB_PORT=5432"
if not defined DB_USER set "DB_USER=postgres"
if not defined DB_NAME set "DB_NAME=household"

REM Recommended: set PGPASSWORD or use %APPDATA%\postgresql\pgpass.conf
set "DUMP_DIR=."

REM ---------- Timestamp (YYYYMMDD_HHMISS) ----------
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list') do set "datetime=%%I"
set "YYYY=%datetime:~0,4%"
set "MM=%datetime:~4,2%"
set "DD=%datetime:~6,2%"
set "HH=%datetime:~8,2%"
set "MI=%datetime:~10,2%"
set "SS=%datetime:~12,2%"
set "DUMP_FILENAME=dump-%YYYY%%MM%%DD%_%HH%%MI%%SS%.dump"
set "DUMP_FILE_PATH=%DUMP_DIR%\%DUMP_FILENAME%"

echo ------------------------------------------------------------
echo Starting dump for database "%DB_NAME%" …
echo ------------------------------------------------------------

REM ---------- Locate pg_dump ----------
if "%PG_BIN_DIR%"=="" (
    set "PG_DUMP_CMD=pg_dump"
    where /q pg_dump
    if errorlevel 1 (
        echo.
        echo ERROR: pg_dump not found in PATH. >&2
        echo        Set PGBINDIR or add the PostgreSQL bin folder to PATH. >&2
        exit /b 1
    )
) else (
    set "PG_DUMP_CMD=%PG_BIN_DIR%\pg_dump"
    if not exist "%PG_DUMP_CMD%" (
        echo.
        echo ERROR: pg_dump not found at "%PG_DUMP_CMD%". >&2
        exit /b 1
    )
)

REM ---------- Execute pg_dump ----------
"%PG_DUMP_CMD%" ^
    --host="%DB_HOST%" ^
    --port="%DB_PORT%" ^
    --username="%DB_USER%" ^
    --format=c ^
    --file="%DUMP_FILE_PATH%" ^
    "%DB_NAME%"

if errorlevel 1 (
    echo.
    echo !!! Dump failed – please review the error messages above. >&2
    exit /b 1
)

echo ------------------------------------------------------------
echo Dump completed successfully: "%DUMP_FILE_PATH%"
echo ------------------------------------------------------------

endlocal