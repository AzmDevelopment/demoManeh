# File Upload Implementation Guide

## ?? **Complete Solution for File Uploads in Workflow**

This guide covers how to upload files from your Angular frontend to the workflow API for Step 2 (Document Upload).

---

## ?? **API Endpoints**

### 1. Upload Files
```
POST /api/workflow/instances/{instanceId}/steps/{stepId}/upload?uploadedBy={email}
Content-Type: multipart/form-data
```

### 2. Download File
```
GET /api/workflow/files/{fileName}
```

---

## ?? **Backend Implementation (Already Done)**

### Files Created:
1. ? `backend/Models/FileMetadata.cs` - File metadata model
2. ? `backend/Services/IFileStorageService.cs` - Storage interface
3. ? `backend/Services/LocalFileStorageService.cs` - Local file storage
4. ? `backend/Validation/Rules/FileUploadValidationRule.cs` - File validation
5. ? `backend/Controllers/WorkflowController.cs` - Upload/download endpoints

### Configuration:
```json
{
  "FileStorage": {
    "LocalPath": "C:\\work\\Azm\\Maneh\\demo\\demoManeh\\uploads"
  }
}
```

---

## ?? **Angular Frontend Implementation**

### **Method 1: Separate Upload Then Submit (RECOMMENDED)**

This approach uploads files first, then submits the step with file metadata.

#### Step 1: Upload Files Component

```typescript
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-document-upload-step',
  template: `
    <h2>Document Upload - Step 2</h2>
    
    <form (ngSubmit)="onSubmit()">
      <!-- Technical Specifications (Single File) -->
      <div class="form-group">
        <label>Technical Specifications *</label>
        <input 
          type="file" 
          (change)="onFileSelected($event, 'technicalSpecs')"
          accept=".pdf,.doc,.docx"
        />
        <small>Allowed: PDF, DOC, DOCX. Max size: 10MB</small>
        
        <div *ngIf="uploadedFiles['technicalSpecs']">
          ? Uploaded: {{ uploadedFiles['technicalSpecs'].originalFileName }}
        </div>
      </div>

      <!-- Test Reports (Multiple Files) -->
      <div class="form-group">
        <label>Test Reports *</label>
        <input 
          type="file" 
          (change)="onFileSelected($event, 'testReports')"
          accept=".pdf"
          multiple
        />
        <small>Allowed: PDF only. Multiple files allowed.</small>
        
        <div *ngIf="uploadedFiles['testReports']">
          ? Uploaded {{ uploadedFiles['testReports'].length }} file(s)
          <ul>
            <li *ngFor="let file of uploadedFiles['testReports']">
              {{ file.originalFileName }} ({{ formatBytes(file.fileSizeBytes) }})
            </li>
          </ul>
        </div>
      </div>

      <!-- Upload Progress -->
      <div *ngIf="uploading" class="alert alert-info">
        Uploading files... {{ uploadProgress }}%
      </div>

      <!-- Validation Errors -->
      <div *ngIf="validationErrors.length > 0" class="alert alert-danger">
        <ul>
          <li *ngFor="let error of validationErrors">{{ error }}</li>
        </ul>
      </div>

      <!-- Submit Button -->
      <button 
        type="submit" 
        [disabled]="uploading || !allFilesUploaded()"
        class="btn btn-primary"
      >
        Submit Step 2
      </button>
    </form>
  `
})
export class DocumentUploadStepComponent implements OnInit {
  instanceId: string;
  stepId = 'CT401_step2_document_upload';
  selectedFiles: { [key: string]: File[] } = {};
  uploadedFiles: { [key: string]: any } = {};
  uploading = false;
  uploadProgress = 0;
  validationErrors: string[] = [];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.instanceId = this.route.snapshot.paramMap.get('instanceId')!;
  }

  ngOnInit() {
    // Load current step to check for existing uploads
    this.loadCurrentStep();
  }

  loadCurrentStep() {
    this.http.get(`/api/workflow/instances/${this.instanceId}/current-step`)
      .subscribe((response: any) => {
        // Check if files already uploaded in currentData
        if (response.currentData.technicalSpecs) {
          this.uploadedFiles['technicalSpecs'] = response.currentData.technicalSpecs;
        }
        if (response.currentData.testReports) {
          this.uploadedFiles['testReports'] = response.currentData.testReports;
        }
      });
  }

  onFileSelected(event: Event, fieldKey: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    // Store selected files
    this.selectedFiles[fieldKey] = Array.from(input.files);

    // Immediately upload files
    this.uploadFiles(fieldKey);
  }

  async uploadFiles(fieldKey: string) {
    const files = this.selectedFiles[fieldKey];
    if (!files || files.length === 0) {
      return;
    }

    this.uploading = true;
    this.uploadProgress = 0;
    this.validationErrors = [];

    try {
      const formData = new FormData();
      
      // Add all files with the same field name (for multiple files)
      files.forEach(file => {
        formData.append(fieldKey, file, file.name);
      });

      const uploadedBy = this.getCurrentUserEmail(); // From auth service

      const response = await this.http.post<any>(
        `/api/workflow/instances/${this.instanceId}/steps/${this.stepId}/upload?uploadedBy=${uploadedBy}`,
        formData,
        {
          reportProgress: true,
          observe: 'events'
        }
      ).toPromise();

      // Extract uploaded file metadata
      if (response.uploadedFiles) {
        this.uploadedFiles[fieldKey] = response.uploadedFiles[fieldKey];
      }

      console.log(`Files uploaded for ${fieldKey}:`, this.uploadedFiles[fieldKey]);

    } catch (error: any) {
      console.error('Upload error:', error);
      this.validationErrors.push(`Failed to upload files for ${fieldKey}: ${error.message}`);
    } finally {
      this.uploading = false;
      this.uploadProgress = 0;
    }
  }

  allFilesUploaded(): boolean {
    // Check if required files are uploaded
    return this.uploadedFiles['technicalSpecs'] && this.uploadedFiles['testReports'];
  }

  async onSubmit() {
    if (!this.allFilesUploaded()) {
      this.validationErrors = ['Please upload all required files'];
      return;
    }

    try {
      // Submit step with file metadata
      const submission = {
        certificationId: 'CT401_lithium_battery_new',
        stepId: this.stepId,
        formData: {
          // Include file metadata in form data
          technicalSpecs: this.uploadedFiles['technicalSpecs'],
          testReports: this.uploadedFiles['testReports']
        },
        submittedBy: this.getCurrentUserEmail(),
        decision: 'approve',
        comments: 'Documents uploaded successfully'
      };

      const response = await this.http.post(
        `/api/workflow/instances/${this.instanceId}/submit`,
        submission
      ).toPromise();

      // Move to next step
      this.router.navigate(['/workflow', this.instanceId, 'step', 3]);

    } catch (error: any) {
      console.error('Submit error:', error);
      this.validationErrors = error.error?.errors?.map((e: any) => e.message) || ['Submission failed'];
    }
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getCurrentUserEmail(): string {
    // Get from your auth service
    return 'user@example.com';
  }
}
```

---

### **Method 2: Base64 Encoding (Not Recommended)**

If you must use base64 encoding (e.g., for legacy reasons):

```typescript
async convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]); // Remove data:image/png;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async onFileSelected(event: Event, fieldKey: string) {
  const input = event.target as HTMLInputElement;
  if (!input.files) return;

  const file = input.files[0];
  const base64Content = await this.convertFileToBase64(file);

  this.uploadedFiles[fieldKey] = {
    originalFileName: file.name,
    contentType: file.type,
    fileSizeBytes: file.size,
    fileExtension: '.' + file.name.split('.').pop(),
    base64Content: base64Content,
    uploadedAt: new Date().toISOString(),
    uploadedBy: this.getCurrentUserEmail()
  };
}
```

**Note**: This approach is NOT recommended because:
- Increases data size by ~33%
- Can cause memory issues with large files
- Slower processing
- Not industry standard

---

## ?? **Testing with Postman/Swagger**

### Upload Files

**Endpoint**: `POST /api/workflow/instances/{instanceId}/steps/CT401_step2_document_upload/upload?uploadedBy=test@example.com`

**Body** (form-data):
```
technicalSpecs: [file] specification.pdf
testReports: [file] test1.pdf
testReports: [file] test2.pdf
```

**Response**:
```json
{
  "instanceId": "abc-123",
  "stepId": "CT401_step2_document_upload",
  "uploadedFiles": {
    "technicalSpecs": {
      "fieldKey": "technicalSpecs",
      "originalFileName": "specification.pdf",
      "storedFileName": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf",
      "contentType": "application/pdf",
      "fileSizeBytes": 1048576,
      "fileExtension": ".pdf",
      "uploadedAt": "2024-01-25T10:00:00Z",
      "uploadedBy": "test@example.com",
      "url": "/api/workflow/files/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf"
    },
    "testReports": [
      {
        "fieldKey": "testReports",
        "originalFileName": "test1.pdf",
        "storedFileName": "b2c3d4e5-f6a7-8901-bcde-f12345678901.pdf",
        "contentType": "application/pdf",
        "fileSizeBytes": 524288,
        "fileExtension": ".pdf",
        "uploadedAt": "2024-01-25T10:00:01Z",
        "uploadedBy": "test@example.com",
        "url": "/api/workflow/files/b2c3d4e5-f6a7-8901-bcde-f12345678901.pdf"
      },
      {
        "fieldKey": "testReports",
        "originalFileName": "test2.pdf",
        "storedFileName": "c3d4e5f6-a7b8-9012-cdef-123456789012.pdf",
        "contentType": "application/pdf",
        "fileSizeBytes": 262144,
        "fileExtension": ".pdf",
        "uploadedAt": "2024-01-25T10:00:02Z",
        "uploadedBy": "test@example.com",
        "url": "/api/workflow/files/c3d4e5f6-a7b8-9012-cdef-123456789012.pdf"
      }
    ]
  },
  "totalFiles": 3
}
```

---

### Submit Step with File Metadata

**Endpoint**: `POST /api/workflow/instances/{instanceId}/submit`

**Body**:
```json
{
  "certificationId": "CT401_lithium_battery_new",
  "stepId": "CT401_step2_document_upload",
  "formData": {
    "technicalSpecs": {
      "originalFileName": "specification.pdf",
      "storedFileName": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf",
      "contentType": "application/pdf",
      "fileSizeBytes": 1048576,
      "fileExtension": ".pdf",
      "uploadedAt": "2024-01-25T10:00:00Z",
      "uploadedBy": "test@example.com",
      "url": "/api/workflow/files/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf"
    },
    "testReports": [
      {
        "originalFileName": "test1.pdf",
        "storedFileName": "b2c3d4e5-f6a7-8901-bcde-f12345678901.pdf",
        ...
      },
      {
        "originalFileName": "test2.pdf",
        "storedFileName": "c3d4e5f6-a7b8-9012-cdef-123456789012.pdf",
        ...
      }
    ]
  },
  "submittedBy": "test@example.com",
  "decision": "approve",
  "comments": "All documents uploaded"
}
```

---

## ? **File Validation Rules**

The system automatically validates files based on step definition:

### From `CT401_step2_document_upload.json`:

```json
{
  "key": "technicalSpecs",
  "type": "file",
  "templateOptions": {
    "label": "Technical Specifications",
    "required": true,
    "accept": ".pdf,.doc,.docx",
    "maxFileSize": 10485760  // 10MB in bytes
  }
}
```

**Validation Rules Created Automatically**:
1. ? **Required** - File must be uploaded
2. ? **File Type** - Must be .pdf, .doc, or .docx
3. ? **File Size** - Must not exceed 10MB
4. ? **Single File** - Only one file allowed (no `multiple: true`)

### For Multiple Files:

```json
{
  "key": "testReports",
  "type": "file",
  "templateOptions": {
    "required": true,
    "multiple": true,
    "accept": ".pdf"
  }
}
```

**Validation Rules**:
1. ? **Required** - At least one file must be uploaded
2. ? **File Type** - All files must be .pdf
3. ? **Multiple Files** - Multiple files allowed

---

## ?? **Complete Workflow**

```
???????????????????????????????????????????????????????????
?              1. User Selects Files                       ?
?  technicalSpecs: specification.pdf                      ?
?  testReports: test1.pdf, test2.pdf                      ?
???????????????????????????????????????????????????????????
                         ?
???????????????????????????????????????????????????????????
?              2. Upload Files (Immediately)               ?
?  POST /api/workflow/instances/{id}/steps/{step}/upload  ?
?  Content-Type: multipart/form-data                      ?
???????????????????????????????????????????????????????????
                         ?
???????????????????????????????????????????????????????????
?              3. Files Stored on Server                   ?
?  Location: C:\...\uploads\{guid}.pdf                    ?
?  Returns: FileMetadata objects                          ?
???????????????????????????????????????????????????????????
                         ?
???????????????????????????????????????????????????????????
?              4. User Clicks "Submit"                     ?
?  Includes file metadata in formData                     ?
???????????????????????????????????????????????????????????
                         ?
???????????????????????????????????????????????????????????
?              5. Validate Step                            ?
?  - Check required files uploaded                        ?
?  - Validate file types                                  ?
?  - Validate file sizes                                  ?
???????????????????????????????????????????????????????????
                         ?
???????????????????????????????????????????????????????????
?              6. Save to Database                         ?
?  WorkflowInstance.CurrentData = {                       ?
?    technicalSpecs: {FileMetadata},                      ?
?    testReports: [{FileMetadata}, {FileMetadata}]        ?
?  }                                                       ?
???????????????????????????????????????????????????????????
                         ?
???????????????????????????????????????????????????????????
?              7. Move to Next Step                        ?
?  currentStep = "CT401_step3_initial_review"             ?
???????????????????????????????????????????????????????????
```

---

## ?? **Security Considerations**

### File Type Validation
- ? Whitelist allowed extensions
- ? Verify content type
- ? Don't rely only on file extension

### File Size Limits
- ? Enforce per-file limits
- ? Enforce total upload limits
- ? Configure IIS/Kestrel max request size

### File Storage
- ? Store files outside web root
- ? Use unique generated filenames (GUIDs)
- ? Don't expose original file paths
- ? Scan files for viruses (optional)

### Access Control
- ? Verify user has permission to upload
- ? Verify user has permission to download
- ? Track who uploaded which files

---

## ?? **Summary**

### ? **What's Implemented**:
1. File upload endpoint with multipart/form-data support
2. File storage service (local file system)
3. File validation rules (size, type, count)
4. File metadata tracking
5. File download endpoint
6. Automatic validation rule creation from step definition

### ?? **What You Need to Do**:
1. Implement Angular file upload component (see example above)
2. Test file upload in your frontend
3. Configure file storage path if needed
4. Add virus scanning if required (optional)

### ?? **Recommended Flow**:
1. User selects files ? Immediate upload
2. Store file metadata in component
3. Submit step with file metadata
4. Files are validated automatically
5. Metadata saved to database
6. Users can download files later

---

**File upload is now fully implemented and ready to use!** ??
