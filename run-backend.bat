@echo off
echo ====================================================================
echo Starting Caption ^& Chapter Studio (Spring Boot Backend)...
echo ====================================================================

mvn spring-boot:run

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Maven was not found in your PATH or the build failed.
    echo You can also open this folder in IntelliJ IDEA, Eclipse, NetBeans,
    echo or VS Code with the Java Extension Pack and run CaptionChapterStudioApplication.java!
    pause
)
