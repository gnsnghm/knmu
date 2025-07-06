@echo off
REM ------------------------------------------------------------
REM PostgreSQL restore helper (UTF-8 aware)
REM ------------------------------------------------------------

REM 1) Use UTF-8 in the console.
chcp 65001 > nul

REM 2) Keep variable changes local.
setlocal

REM ---------- Configuration ----------
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
REM -----------------------------------

REM ---------- Parse argument ----------
set "DUMP_FILE=%~1"

if "%DUMP_FILE%"=="" (
    echo ERROR: Please specify the dump file to restore. >&2
    echo USAGE: %~nx0 ^<path\to\dump-file.dump^> >&2
    exit /b 1
)

if not exist "%DUMP_FILE%" (
    echo ERROR: File not found: "%DUMP_FILE%" >&2
    exit /b 1
)

echo ------------------------------------------------------------
echo Target database  : "%DB_NAME%"
echo Dump file        : "%DUMP_FILE%"
echo ------------------------------------------------------------
set /p "answer=Start restore? (y/N): "
if /i not "%answer%"=="y" (
    echo Restore aborted.
    exit /b 0
)

echo.
echo Restoring "%DUMP_FILE%" into "%DB_NAME%" …

REM ---------- Locate pg_restore ----------
if "%PG_BIN_DIR%"=="" (
    set "PG_RESTORE_CMD=pg_restore"
    where /q pg_restore
    if errorlevel 1 (
        echo.
        echo ERROR: pg_restore not found in PATH. >&2
        echo        Set PGBINDIR or add the PostgreSQL bin folder to PATH. >&2
        exit /b 1
    )
) else (
    set "PG_RESTORE_CMD=%PG_BIN_DIR%\pg_restore"
    if not exist "%PG_RESTORE_CMD%" (
        echo.
        echo ERROR: pg_restore not found at "%PG_RESTORE_CMD%". >&2
        exit /b 1
    )
)

REM ---------- Execute pg_restore ----------
"%PG_RESTORE_CMD%" ^
    --host="%DB_HOST%" ^
    --port="%DB_PORT%" ^
    --username="%DB_USER%" ^
    --dbname="%DB_NAME%" ^
    --clean ^
    --jobs=4 ^
    "%DUMP_FILE%"

if errorlevel 1 (
    echo.
    echo !!! Restore failed – see messages above. >&2
    exit /b 1
)

echo ------------------------------
echo Restore completed successfully
echo ------------------------------

endlocal
