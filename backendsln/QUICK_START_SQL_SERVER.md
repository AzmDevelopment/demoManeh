# Quick Start: SQL Server Setup

## ? Configuration Updated

The application is now configured to use **SQL Server Developer Edition** on `localhost` instead of LocalDB.

---

## ?? Quick Start (3 Steps)

### Step 1: Verify SQL Server is Running

```powershell
# Check SQL Server status
Get-Service -Name "MSSQLSERVER"
```

**Expected**: Status = Running

If not running:
```powershell
Start-Service -Name "MSSQLSERVER"
```

---

### Step 2: Test Connection in SSMS

1. Open **SQL Server Management Studio (SSMS)**
2. Server name: `localhost`
3. Authentication: **Windows Authentication**
4. Click **Connect**

? If connected successfully, proceed to Step 3!

---

### Step 3: Run the Application

```bash
cd C:\work\Azm\Maneh\demo\demoManeh\backendsln
dotnet run --project backend
```

**Expected Output**:
```
info: Program[0]
      Ensuring database is created and migrated...
info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (...)
      CREATE DATABASE [WorkflowEngineDb];
info: Program[0]
      Database migration completed successfully
Now listening on: http://localhost:5000
```

? **Database `WorkflowEngineDb` will be created automatically!**

---

## ?? Access Points

- **Swagger UI**: http://localhost:5000/
- **API Base**: http://localhost:5000/api/workflow
- **Database**: `localhost.WorkflowEngineDb` (in SSMS)

---

## ?? Verify Database Creation

### In SSMS:
1. **Refresh Databases** (right-click ? Refresh)
2. **Expand**: `WorkflowEngineDb` ? `Tables`
3. **You should see**:
   - `dbo.WorkflowInstances`
   - `dbo.StepHistoryDetails`
   - `dbo.__EFMigrationsHistory`

### Or run this query:
```sql
USE WorkflowEngineDb;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';
```

---

## ?? Test the API

### 1. Open Swagger UI
```
http://localhost:5000/
```

### 2. Create a Workflow Instance

**Endpoint**: `POST /api/workflow/instances`

**Body**:
```json
{
  "certificationId": "CT401_lithium_battery_new",
  "createdBy": "test@example.com",
  "priority": 3
}
```

**Copy the `id` from response!**

### 3. Check Database

In SSMS:
```sql
USE WorkflowEngineDb;
SELECT * FROM WorkflowInstances;
```

? **You should see your workflow instance!**

---

## ??? Troubleshooting

### Problem: Cannot connect to localhost

**Solution 1**: Check if SQL Server is running
```powershell
Get-Service -Name "MSSQLSERVER"
```

**Solution 2**: Use named instance
If you have SQL Server Express, try:
```json
"Server=localhost\\SQLEXPRESS;..."
```

**Solution 3**: Enable TCP/IP
1. Open **SQL Server Configuration Manager**
2. Go to: **SQL Server Network Configuration** ? **Protocols for MSSQLSERVER**
3. Right-click **TCP/IP** ? **Enable**
4. Restart SQL Server service

---

### Problem: Login failed for user

**Solution**: Grant permissions to your Windows user

In SSMS, run:
```sql
-- Replace DOMAIN\YourUsername with your Windows username
CREATE LOGIN [DOMAIN\YourUsername] FROM WINDOWS;
USE WorkflowEngineDb;
CREATE USER [DOMAIN\YourUsername] FOR LOGIN [DOMAIN\YourUsername];
ALTER ROLE db_owner ADD MEMBER [DOMAIN\YourUsername];
```

Or find your username:
```powershell
whoami
```

---

### Problem: Database already exists

**Solution**: Drop and recreate
```bash
cd backend
dotnet ef database drop --context WorkflowDbContext --force
dotnet run
```

---

## ?? Connection String Details

**Current Configuration** (`appsettings.json`):
```json
"ConnectionStrings": {
  "WorkflowDb": "Server=localhost;Database=WorkflowEngineDb;Integrated Security=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
}
```

**Breakdown**:
- `Server=localhost` ? Your local SQL Server
- `Database=WorkflowEngineDb` ? Database name
- `Integrated Security=True` ? Windows Authentication
- `TrustServerCertificate=True` ? Trust SSL certificate
- `MultipleActiveResultSets=true` ? Allow multiple queries

---

## ?? Success Checklist

- [ ] SQL Server is running (`Get-Service -Name "MSSQLSERVER"`)
- [ ] Can connect via SSMS to `localhost`
- [ ] Application runs without errors (`dotnet run --project backend`)
- [ ] Database `WorkflowEngineDb` is created
- [ ] Tables exist in SSMS
- [ ] Swagger UI loads at http://localhost:5000/
- [ ] Can create workflow instance via API
- [ ] Data appears in SQL Server tables

---

## ?? Full Documentation

For detailed troubleshooting and configuration options, see:
- **SQL_SERVER_SETUP.md** - Complete setup guide
- **LOCALDB_IMPLEMENTATION.md** - Database schema details
- **TESTING_GUIDE.md** - API testing examples

---

## ? Summary

? **Connection string updated** to use SQL Server on localhost  
? **Windows Authentication** enabled  
? **Database auto-created** on first run  
? **Build successful** (no errors)  
? **Ready to test** with Swagger UI  

**You're all set! Just run the application and start testing.** ??
