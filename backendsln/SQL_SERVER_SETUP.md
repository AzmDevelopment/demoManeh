# SQL Server Developer Edition Setup Guide

## ? Connection String Updated

The application has been configured to use **SQL Server Developer Edition** on localhost instead of LocalDB.

---

## ?? Connection String Changes

### Old (LocalDB)
```json
"Server=(localdb)\\mssqllocaldb;Database=WorkflowEngineDb;Trusted_Connection=True;..."
```

### New (SQL Server localhost)
```json
"Server=localhost;Database=WorkflowEngineDb;Integrated Security=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
```

---

## ??? Connection String Options

### Option 1: Windows Authentication (Integrated Security) - CURRENT
```json
"ConnectionStrings": {
  "WorkflowDb": "Server=localhost;Database=WorkflowEngineDb;Integrated Security=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
}
```

? **Recommended for development**  
? Uses your Windows login  
? No password needed  

### Option 2: SQL Server Authentication
```json
"ConnectionStrings": {
  "WorkflowDb": "Server=localhost;Database=WorkflowEngineDb;User Id=sa;Password=YourPassword123;TrustServerCertificate=True;MultipleActiveResultSets=true"
}
```

?? Requires SQL Server login  
?? Password must be configured in SQL Server  

### Option 3: Named Instance
If your SQL Server uses a named instance (e.g., SQLEXPRESS):
```json
"ConnectionStrings": {
  "WorkflowDb": "Server=localhost\\SQLEXPRESS;Database=WorkflowEngineDb;Integrated Security=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
}
```

### Option 4: IP Address
```json
"ConnectionStrings": {
  "WorkflowDb": "Server=127.0.0.1;Database=WorkflowEngineDb;Integrated Security=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
}
```

---

## ?? Testing the Connection

### Step 1: Verify SQL Server is Running

Open **SQL Server Configuration Manager** or run:

```powershell
# Check SQL Server service status
Get-Service -Name "MSSQLSERVER"

# Or for named instance
Get-Service -Name "MSSQL$SQLEXPRESS"
```

**Expected Status**: Running

### Step 2: Test Connection with SSMS

1. Open **SQL Server Management Studio (SSMS)**
2. Connect to: `localhost` (or `localhost\SQLEXPRESS`)
3. Use **Windows Authentication**
4. Click **Connect**

? If connection succeeds, your SQL Server is ready!

### Step 3: Check SQL Server Browser (if using named instances)

```powershell
Get-Service -Name "SQLBrowser"
```

If stopped, start it:
```powershell
Start-Service -Name "SQLBrowser"
```

---

## ?? Running the Application

### Step 1: Clean and Rebuild
```bash
cd C:\work\Azm\Maneh\demo\demoManeh\backendsln
dotnet clean
dotnet build
```

### Step 2: Apply Database Migrations

The application will automatically create the database on first run, but you can manually apply migrations:

```bash
cd backend
dotnet ef database update --context WorkflowDbContext
```

**Expected Output**:
```
Applying migration '20260125161652_InitialCreate'.
Done.
```

### Step 3: Run the Application
```bash
cd C:\work\Azm\Maneh\demo\demoManeh\backendsln
dotnet run --project backend
```

**Expected Startup Log**:
```
info: Program[0]
      Ensuring database is created and migrated...
info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (45ms) [Parameters=[], CommandType='Text']
      CREATE DATABASE [WorkflowEngineDb];
info: Program[0]
      Database migration completed successfully
Now listening on: http://localhost:5000
```

---

## ?? Verifying the Database

### Using SSMS

1. **Connect to SQL Server** (localhost)
2. **Expand Databases** in Object Explorer
3. **Look for**: `WorkflowEngineDb`
4. **Expand Tables**:
   - `dbo.WorkflowInstances`
   - `dbo.StepHistoryDetails`
   - `dbo.__EFMigrationsHistory`

### Using SQL Query

```sql
-- Check if database exists
SELECT name FROM sys.databases WHERE name = 'WorkflowEngineDb';

-- List all tables
USE WorkflowEngineDb;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';

-- Check migration history
SELECT * FROM __EFMigrationsHistory;

-- View table schemas
EXEC sp_help 'WorkflowInstances';
EXEC sp_help 'StepHistoryDetails';
```

---

## ??? Troubleshooting

### Issue 1: Cannot connect to localhost

**Error**: `A network-related or instance-specific error occurred`

**Solutions**:

1. **Check SQL Server is running**:
```powershell
Get-Service -Name "MSSQLSERVER"
Start-Service -Name "MSSQLSERVER"
```

2. **Enable TCP/IP Protocol**:
   - Open **SQL Server Configuration Manager**
   - Navigate to: **SQL Server Network Configuration** ? **Protocols for MSSQLSERVER**
   - **Enable TCP/IP**
   - **Restart SQL Server service**

3. **Check Firewall**:
```powershell
# Allow SQL Server through firewall
New-NetFirewallRule -DisplayName "SQL Server" -Direction Inbound -LocalPort 1433 -Protocol TCP -Action Allow
```

4. **Try named instance**:
```json
"Server=localhost\\SQLEXPRESS;..."
```

---

### Issue 2: Login failed for user

**Error**: `Login failed for user 'DOMAIN\User'`

**Solutions**:

1. **Add Windows user to SQL Server**:

In SSMS:
```sql
-- Create login for current Windows user
CREATE LOGIN [DOMAIN\YourUsername] FROM WINDOWS;

-- Grant database access
USE WorkflowEngineDb;
CREATE USER [DOMAIN\YourUsername] FOR LOGIN [DOMAIN\YourUsername];
ALTER ROLE db_owner ADD MEMBER [DOMAIN\YourUsername];
```

2. **Or enable SQL Server Authentication**:

Update connection string:
```json
"WorkflowDb": "Server=localhost;Database=WorkflowEngineDb;User Id=sa;Password=YourPassword;TrustServerCertificate=True"
```

Enable SQL Server Authentication:
```sql
-- Enable mixed mode authentication
USE master;
EXEC xp_instance_regwrite 
  N'HKEY_LOCAL_MACHINE', 
  N'Software\Microsoft\MSSQLServer\MSSQLServer',
  N'LoginMode', 
  REG_DWORD, 
  2;
-- Restart SQL Server after this
```

---

### Issue 3: Database already exists

**Error**: `Database 'WorkflowEngineDb' already exists`

**Solutions**:

1. **Use existing database** (migrations will update schema)
2. **Or drop and recreate**:

```bash
# Drop database
dotnet ef database drop --context WorkflowDbContext --force

# Recreate
dotnet run --project backend
```

Or in SQL:
```sql
USE master;
DROP DATABASE WorkflowEngineDb;
```

---

### Issue 4: Certificate validation error

**Error**: `The certificate chain was issued by an authority that is not trusted`

**Solution**: Already handled with `TrustServerCertificate=True` in connection string.

If still occurs, ensure your connection string includes:
```json
"TrustServerCertificate=True"
```

---

## ?? Connection String Parameters Explained

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `Server` | `localhost` | SQL Server hostname or IP |
| `Database` | `WorkflowEngineDb` | Database name |
| `Integrated Security` | `True` | Use Windows Authentication |
| `TrustServerCertificate` | `True` | Trust self-signed SSL certificates |
| `MultipleActiveResultSets` | `true` | Allow multiple result sets per connection |
| `Encrypt` | (Optional) `False` | Disable SSL encryption for local dev |
| `Connection Timeout` | (Default: 30) | Seconds before timeout |

---

## ?? Security Best Practices

### Development (localhost)
? **Windows Authentication** (Integrated Security)  
? **TrustServerCertificate=True**  
? **No password in connection string**  

### Production
? **SQL Server Authentication** with strong password  
? **Store connection string in Azure Key Vault / AWS Secrets Manager**  
? **Enable SSL encryption**: `Encrypt=True`  
? **Validate certificates**: `TrustServerCertificate=False`  
? **Use managed identities** (Azure SQL, AWS RDS)  
? **Restrict database user permissions**  

Example production connection string:
```json
"WorkflowDb": "Server=prod-server.database.windows.net;Database=WorkflowEngineDb;User Id=app_user;Password=***;Encrypt=True;TrustServerCertificate=False"
```

---

## ?? Testing After Setup

### 1. Run Application
```bash
dotnet run --project backend
```

### 2. Open Swagger UI
```
http://localhost:5000/
```

### 3. Create Workflow Instance
```http
POST /api/workflow/instances
{
  "certificationId": "CT401_lithium_battery_new",
  "createdBy": "test@example.com",
  "priority": 3
}
```

### 4. Check Database in SSMS
```sql
USE WorkflowEngineDb;
SELECT * FROM WorkflowInstances;
```

**Expected**: One row with the workflow instance

### 5. Submit Step Data
```http
POST /api/workflow/instances/{id}/submit
{
  "stepId": "CT401_step1_data_entry",
  "formData": {
    "applicantName": "John Doe",
    "companyName": "ABC Corp"
  },
  "submittedBy": "test@example.com"
}
```

### 6. Verify Data Persisted
```sql
SELECT 
    Id,
    CurrentStep,
    Status,
    JSON_VALUE(CurrentData, '$.applicantName') as ApplicantName,
    JSON_VALUE(CurrentData, '$.companyName') as CompanyName
FROM WorkflowInstances;
```

**Expected**: Data saved in JSON columns

---

## ?? Files Modified

### 1. `appsettings.json`
```json
"ConnectionStrings": {
  "WorkflowDb": "Server=localhost;Database=WorkflowEngineDb;Integrated Security=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
}
```

### 2. `appsettings.Development.json`
```json
"ConnectionStrings": {
  "WorkflowDb": "Server=localhost;Database=WorkflowEngineDb;Integrated Security=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
}
```

---

## ?? Quick Start Checklist

- [ ] SQL Server Developer Edition installed
- [ ] SQL Server service is running
- [ ] Can connect via SSMS to `localhost`
- [ ] Connection string updated in `appsettings.json`
- [ ] Application builds successfully (`dotnet build`)
- [ ] Database created on first run
- [ ] Tables exist (`WorkflowInstances`, `StepHistoryDetails`)
- [ ] Can create workflow instance via API
- [ ] Data persists in SQL Server
- [ ] Can query data in SSMS

---

## ?? Useful SQL Server Commands

### Check SQL Server Version
```sql
SELECT @@VERSION;
```

### Check Connection Count
```sql
SELECT 
    DB_NAME(dbid) as DatabaseName,
    COUNT(dbid) as NumberOfConnections
FROM sys.sysprocesses
WHERE dbid > 0
GROUP BY dbid, DB_NAME(dbid);
```

### Monitor Query Performance
```sql
SELECT 
    text,
    total_elapsed_time / 1000000.0 as elapsed_seconds,
    execution_count
FROM sys.dm_exec_query_stats
CROSS APPLY sys.dm_exec_sql_text(sql_handle)
ORDER BY total_elapsed_time DESC;
```

### Check Database Size
```sql
USE WorkflowEngineDb;
EXEC sp_spaceused;
```

---

## ?? Getting Help

### Connection String Issues
- Check SQL Server service is running
- Verify TCP/IP is enabled
- Test connection in SSMS first
- Check Windows Firewall settings

### Authentication Issues
- Use Windows Authentication for development
- Grant database permissions to your Windows user
- For SQL Auth, ensure mixed mode is enabled

### Migration Issues
- Drop database and recreate: `dotnet ef database drop`
- Check EF Core logs in console
- Verify connection string is correct

---

## ? Summary

? **Updated connection string** to use localhost SQL Server  
? **Windows Authentication** configured (Integrated Security)  
? **SSL certificate trust** enabled for local dev  
? **Multiple result sets** enabled  
? **Configuration files** updated  
? **Ready to run** with SQL Server Developer Edition  

**Next Step**: Run `dotnet run --project backend` and test! ??
