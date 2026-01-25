# Quick Reference: File Upload API

## ?? **Upload Files**

### Endpoint
```
POST /api/workflow/instances/{instanceId}/steps/{stepId}/upload?uploadedBy={email}
```

### Request (Postman/Swagger)
**Content-Type**: `multipart/form-data`

**Form Fields**:
- `technicalSpecs`: [file] specification.pdf
- `testReports`: [file] test1.pdf
- `testReports`: [file] test2.pdf  ? Same field name for multiple files

### Response
```json
{
  "instanceId": "abc-123",
  "uploadedFiles": {
    "technicalSpecs": { ...fileMetadata },
    "testReports": [ {...fileMetadata}, {...fileMetadata} ]
  }
}
```

---

## ?? **Download File**

### Endpoint
```
GET /api/workflow/files/{storedFileName}
```

### Example
```
GET /api/workflow/files/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf
```

---

## ? **Validation Rules (Automatic)**

Based on your step definition:

```json
{
  "key": "technicalSpecs",
  "type": "file",
  "templateOptions": {
    "required": true,
    "accept": ".pdf,.doc,.docx",
    "maxFileSize": 10485760  // 10MB
  }
}
```

**Validates**:
- ? File is required
- ? File type must be .pdf, .doc, or .docx
- ? File size must be ? 10MB

---

## ?? **Angular Example (Minimal)**

```typescript
// Upload files immediately when selected
onFileSelected(event: Event, fieldKey: string) {
  const files = (event.target as HTMLInputElement).files;
  if (!files) return;

  const formData = new FormData();
  Array.from(files).forEach(file => {
    formData.append(fieldKey, file, file.name);
  });

  this.http.post(
    `/api/workflow/instances/${this.instanceId}/steps/${this.stepId}/upload?uploadedBy=user@example.com`,
    formData
  ).subscribe(response => {
    this.uploadedFiles[fieldKey] = response.uploadedFiles[fieldKey];
  });
}

// Submit step with file metadata
onSubmit() {
  const submission = {
    certificationId: 'CT401_lithium_battery_new',
    stepId: 'CT401_step2_document_upload',
    formData: {
      technicalSpecs: this.uploadedFiles['technicalSpecs'],
      testReports: this.uploadedFiles['testReports']
    },
    submittedBy: 'user@example.com'
  };

  this.http.post(
    `/api/workflow/instances/${this.instanceId}/submit`,
    submission
  ).subscribe(response => {
    // Move to next step
    this.router.navigate(['/workflow', this.instanceId, 'step', 3]);
  });
}
```

---

## ?? **File Storage Location**

**Default**: `C:\work\Azm\Maneh\demo\demoManeh\uploads`

**Configure in** `appsettings.json`:
```json
{
  "FileStorage": {
    "LocalPath": "C:\\your\\custom\\path"
  }
}
```

---

## ?? **Quick Test in Swagger**

1. **Start application**: `dotnet run --project backend`
2. **Open Swagger**: https://localhost:7047/
3. **Find endpoint**: `POST /api/workflow/instances/{instanceId}/steps/{stepId}/upload`
4. **Fill parameters**:
   - instanceId: (your instance GUID)
   - stepId: `CT401_step2_document_upload`
   - uploadedBy: `test@example.com`
5. **Add files**: Click "Choose File" for each field
6. **Execute**

---

## ? **Don't Use Base64**

**Bad**:
```typescript
// Convert to base64 and include in JSON
const base64 = await convertToBase64(file);
formData = { fileContent: base64 };
```

**Good**:
```typescript
// Use multipart/form-data
const formData = new FormData();
formData.append('technicalSpecs', file, file.name);
```

---

## ? **Summary**

| Action | Method | Endpoint |
|--------|--------|----------|
| Upload files | POST (multipart) | `/instances/{id}/steps/{step}/upload` |
| Download file | GET | `/files/{fileName}` |
| Submit step | POST (JSON) | `/instances/{id}/submit` |

**Flow**: Upload files ? Get metadata ? Submit step with metadata

---

**See `FILEUPLOAD_IMPLEMENTATION.md` for complete Angular component example!**
