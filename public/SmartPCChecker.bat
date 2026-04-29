@echo off
title SmartPCChecker - AI Pro Deep Scan
color 0B
echo.
echo  ==========================================
echo   SmartPCChecker - AI Pro Deep Scan v2.0
echo   smartpcchecker.com
echo  ==========================================
echo.
echo  Scanning hardware, drivers, apps...
echo  This may take 30-60 seconds. Please wait.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$s=@{" ^
    "cpu=gcim Win32_Processor|select Name,NumberOfLogicalProcessors,MaxClockSpeed,CurrentClockSpeed,L2CacheSize,L3CacheSize;" ^
    "ram=gcim Win32_PhysicalMemory|select Capacity,Speed,Manufacturer,PartNumber;" ^
    "gpu=gcim Win32_VideoController|select Name,DriverVersion,DriverDate,AdapterRAM,CurrentHorizontalResolution,CurrentVerticalResolution,CurrentRefreshRate,CurrentBitsPerPixel;" ^
    "monitor=gcim Win32_DesktopMonitor -EA SilentlyContinue|select Name,ScreenWidth,ScreenHeight;" ^
    "disk=Get-PhysicalDisk -EA SilentlyContinue|select FriendlyName,MediaType,Size,HealthStatus,OperationalStatus,BusType;" ^
    "volume=Get-Volume -EA SilentlyContinue|where {$_.DriveLetter}|select DriveLetter,FileSystemLabel,Size,SizeRemaining,HealthStatus,FileSystem;" ^
    "mobo=gcim Win32_BaseBoard|select Manufacturer,Product,Version;" ^
    "bios=gcim Win32_BIOS|select SerialNumber,SMBIOSBIOSVersion,ReleaseDate;" ^
    "os=gcim Win32_OperatingSystem|select Caption,Version,BuildNumber,LastBootUpTime,OSArchitecture,TotalVisibleMemorySize,FreePhysicalMemory;" ^
    "problems=gcim Win32_PnPEntity|where {$_.ConfigManagerErrorCode -ne 0}|select Name,ConfigManagerErrorCode;" ^
    "license=Get-CimInstance SoftwareLicensingProduct|where {$_.PartialProductKey}|select Name,LicenseStatus;" ^
    "bsod=(Get-WinEvent System -MaxEvents 1000 -EA SilentlyContinue|where {$_.Id -eq 41}|select -First 10 TimeCreated);" ^
    "defender=Get-MpComputerStatus -EA SilentlyContinue|select AntivirusEnabled,RealTimeProtectionEnabled,AntivirusSignatureLastUpdated,FullScanEndTime,QuickScanEndTime;" ^
    "errors=(Get-WinEvent System -MaxEvents 300 -EA SilentlyContinue|where {$_.Level -le 2}|select -First 15 TimeCreated,ProviderName,LevelDisplayName);" ^
    "battery=gcim Win32_Battery -EA SilentlyContinue|select EstimatedChargeRemaining,BatteryStatus,DesignVoltage;" ^
    "uptime=(Get-Date)-(gcim Win32_OperatingSystem).LastBootUpTime|select Days,Hours,Minutes;" ^
    "network=Get-NetAdapter -EA SilentlyContinue|select Name,Status,LinkSpeed,MacAddress;" ^
    "apps=Get-ItemProperty HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*|where {$_.DisplayName}|select DisplayName,DisplayVersion,Publisher|Sort DisplayName|select -First 80;" ^
    "startup=gcim Win32_StartupCommand -EA SilentlyContinue|select Name,Command,Location" ^
  "}; $s|ConvertTo-Json -Depth 3" > "%TEMP%\SmartPCChecker_Result.json"

echo.
echo  ==========================================
echo   SCAN COMPLETE!
echo  ==========================================
echo.
echo  1. Notepad will open with your results
echo  2. Press Ctrl+A to select all text
echo  3. Press Ctrl+C to copy
echo  4. Go to SmartPCChecker.com and paste it
echo.
echo  Press any key to open results...
pause >nul

notepad "%TEMP%\SmartPCChecker_Result.json"
