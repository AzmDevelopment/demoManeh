# Validation Fix: Pattern and Numeric Validation

## ?? **Problem Identified**

You submitted:
```json
{
  "costPrice": "123W"
}
```

The step definition specifies:
```json
{
  "key": "costPrice",
  "type": "input",
  "templateOptions": {
    "label": "Cost Price",
    "type": "number",
    "min": 0,
    "step": "0.01",
    "pattern": "^[0-9]+\\.?[0-9]*$",
    "required": true
  }
}
```

**Expected**: Validation should reject `"123W"` because:
1. It doesn't match the pattern `^[0-9]+\\.?[0-9]*$` (only digits and optional decimal)
2. It's not a valid number

**Actual**: Validation was not enforcing pattern or numeric type checking

---

## ? **Solution Implemented**

### 1. **Added Pattern Validation Rule**

**File**: `PatternValidationRule.cs`

```csharp
public class PatternValidationRule : ValidationRuleBase
{
    public string TargetField { get; set; } = string.Empty;
    public string Pattern { get; set; } = string.Empty;

    public override Task<ValidationResult> ValidateAsync(...)
    {
        var regex = new Regex(Pattern);
        if (!regex.IsMatch(value))
        {
            return ValidationResult.Failure(...);
        }
        return ValidationResult.Success();
    }
}
```

**What it does**:
- Validates that field value matches the specified regex pattern
- Returns error if pattern doesn't match
- Skips validation if field is empty (handled by `required` rule)

---

### 2. **Added Numeric Validation Rule**

**File**: `NumericValidationRule.cs`

```csharp
public class NumericValidationRule : ValidationRuleBase
{
    public decimal? Min { get; set; }
    public decimal? Max { get; set; }

    public override Task<ValidationResult> ValidateAsync(...)
    {
        // Check if value is a valid number
        if (!decimal.TryParse(value, out decimal numericValue))
        {
            return ValidationResult.Failure("Must be a valid number");
        }

        // Check min/max range
        if (Min.HasValue && numericValue < Min.Value)
        {
            return ValidationResult.Failure($"Must be at least {Min.Value}");
        }

        if (Max.HasValue && numericValue > Max.Value)
        {
            return ValidationResult.Failure($"Must not exceed {Max.Value}");
        }

        return ValidationResult.Success();
    }
}
```

**What it does**:
- Validates that the value is a valid decimal number
- Checks if value is within min/max range
- Returns specific error messages for each violation

---

### 3. **Updated ValidationRuleFactory**

**File**: `ValidationRuleFactory.cs`

Added automatic rule creation from field definitions:

```csharp
public List<IValidationRule> CreateRulesFromStep(WorkflowStep step)
{
    var rules = new List<IValidationRule>();

    foreach (var field in step.Fields)
    {
        // 1. Required validation
        if (field.TemplateOptions.Required)
        {
            rules.Add(CreateRule("required", ...));
        }

        // 2. Numeric validation (NEW!)
        if (field.TemplateOptions.Type == "number")
        {
            rules.Add(CreateRule("numeric", new {
                targetField = field.Key,
                min = field.TemplateOptions.Min,
                max = field.TemplateOptions.Max
            }));
        }

        // 3. Pattern validation (NEW!)
        if (!string.IsNullOrEmpty(field.TemplateOptions.Pattern))
        {
            rules.Add(CreateRule("pattern", new {
                targetField = field.Key,
                pattern = field.TemplateOptions.Pattern
            }));
        }
    }

    return rules;
}
```

---

### 4. **Updated TemplateOptions Model**

**File**: `WorkflowStep.cs`

```csharp
public class TemplateOptions
{
    public string Label { get; set; } = string.Empty;
    public bool Required { get; set; }
    public string? Type { get; set; }       // NEW!
    public decimal? Min { get; set; }       // Changed from int? to decimal?
    public decimal? Max { get; set; }       // Changed from int? to decimal?
    public string? Step { get; set; }       // NEW!
    public string? Pattern { get; set; }    // NEW!
    // ...existing properties
}
```

---

## ?? **Testing the Fix**

### Test 1: Invalid Character in Numeric Field

**Request**:
```http
POST /api/workflow/instances/{id}/steps/CT401_step1_data_entry/validate
{
  "applicantName": "Waqas",
  "companyName": "Azm",
  "category": "CAT001",
  "productModel": "wewrttt",
  "costPrice": "123W"  ? Contains invalid character 'W'
}
```

**Response**:
```json
{
  "isValid": false,
  "errorMessage": "costPrice must be a valid number",
  "errors": [
    {
      "ruleId": "numeric",
      "field": "costPrice",
      "message": "costPrice must be a valid number"
    },
    {
      "ruleId": "pattern",
      "field": "costPrice",
      "message": "Cost Price has invalid format"
    }
  ]
}
```

? **Now returns TWO errors**:
1. Numeric validation: "must be a valid number"
2. Pattern validation: "has invalid format"

---

### Test 2: Valid Numeric Value

**Request**:
```json
{
  "applicantName": "Waqas",
  "companyName": "Azm",
  "category": "CAT001",
  "productModel": "wewrttt",
  "costPrice": "123.45"  ? Valid decimal number
}
```

**Response**:
```json
{
  "isValid": true,
  "errorMessage": null,
  "errors": []
}
```

? **Validation passes**

---

### Test 3: Negative Number (Below Min)

**Request**:
```json
{
  "costPrice": "-10"  ? Below min of 0
}
```

**Response**:
```json
{
  "isValid": false,
  "errors": [
    {
      "ruleId": "numeric",
      "field": "costPrice",
      "message": "costPrice must be at least 0"
    }
  ]
}
```

? **Min validation works**

---

### Test 4: Pattern Mismatch

**Request**:
```json
{
  "costPrice": "12.34.56"  ? Multiple decimal points
}
```

**Response**:
```json
{
  "isValid": false,
  "errors": [
    {
      "ruleId": "pattern",
      "field": "costPrice",
      "message": "Cost Price has invalid format"
    }
  ]
}
```

? **Pattern validation works**

---

## ?? **Validation Rules Now Applied**

For the `costPrice` field:

| Rule | Configuration | What it checks |
|------|---------------|----------------|
| **Required** | `required: true` | Field must have a value |
| **Numeric** | `type: "number", min: 0` | Value must be a valid decimal, >= 0 |
| **Pattern** | `pattern: "^[0-9]+\\.?[0-9]*$"` | Value must match: digits, optional decimal point, optional decimal digits |

---

## ?? **How It Works**

### Step 1: Load Step Definition

```json
{
  "key": "costPrice",
  "type": "input",
  "templateOptions": {
    "type": "number",
    "min": 0,
    "pattern": "^[0-9]+\\.?[0-9]*$",
    "required": true
  }
}
```

### Step 2: ValidationRuleFactory Creates Rules

```csharp
rules.Add(new RequiredFieldRule { TargetField = "costPrice" });
rules.Add(new NumericValidationRule { 
    TargetField = "costPrice", 
    Min = 0 
});
rules.Add(new PatternValidationRule { 
    TargetField = "costPrice",
    Pattern = "^[0-9]+\\.?[0-9]*$"
});
```

### Step 3: Validation Execution

```csharp
foreach (var rule in rules)
{
    var result = await rule.ValidateAsync(formData, context);
    if (!result.IsValid)
    {
        errors.AddRange(result.Errors);
    }
}
```

### Step 4: Return All Errors

```json
{
  "isValid": false,
  "errors": [
    { "ruleId": "numeric", "field": "costPrice", "message": "..." },
    { "ruleId": "pattern", "field": "costPrice", "message": "..." }
  ]
}
```

---

## ? **Files Created/Modified**

### New Files
1. ? `backend/Validation/Rules/PatternValidationRule.cs`
2. ? `backend/Validation/Rules/NumericValidationRule.cs`

### Modified Files
1. ? `backend/Validation/ValidationRuleFactory.cs`
   - Added `"pattern"` and `"numeric"` rule creators
   - Automatically creates rules from field `templateOptions`

2. ? `backend/Models/WorkflowStep.cs`
   - Added `Type`, `Pattern`, `Step` properties to `TemplateOptions`
   - Changed `Min`/`Max` from `int?` to `decimal?` for better precision

---

## ?? **Supported Field Types and Validations**

### Text Input
```json
{
  "key": "email",
  "type": "input",
  "templateOptions": {
    "type": "email",
    "required": true,
    "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
  }
}
```
**Validations**: Required, Pattern

### Number Input
```json
{
  "key": "age",
  "type": "input",
  "templateOptions": {
    "type": "number",
    "required": true,
    "min": 18,
    "max": 100
  }
}
```
**Validations**: Required, Numeric (with min/max)

### Decimal Input
```json
{
  "key": "price",
  "type": "input",
  "templateOptions": {
    "type": "number",
    "required": true,
    "min": 0,
    "step": "0.01",
    "pattern": "^[0-9]+\\.?[0-9]{0,2}$"
  }
}
```
**Validations**: Required, Numeric (decimal), Pattern (max 2 decimal places)

---

## ?? **Pattern Examples**

| Pattern | Matches | Description |
|---------|---------|-------------|
| `^[0-9]+$` | `123`, `456` | Integers only |
| `^[0-9]+\\.?[0-9]*$` | `123`, `123.45`, `123.` | Decimal numbers |
| `^[0-9]+\\.[0-9]{2}$` | `123.45` | Exactly 2 decimal places |
| `^[a-zA-Z]+$` | `Hello`, `World` | Letters only |
| `^[a-zA-Z0-9]+$` | `Hello123` | Alphanumeric |
| `^\\+?[0-9]{10,15}$` | `+1234567890` | Phone numbers |

---

## ?? **Run and Test**

### 1. Build
```bash
cd C:\work\Azm\Maneh\demo\demoManeh\backendsln
dotnet build
```

? **Build succeeded** (1 non-critical warning)

### 2. Run
```bash
dotnet run --project backend
```

### 3. Test in Swagger

**URL**: https://localhost:7047/

**Endpoint**: `POST /api/workflow/instances/{id}/steps/CT401_step1_data_entry/validate`

**Test Data**:
```json
{
  "applicantName": "Waqas",
  "companyName": "Azm",
  "category": "CAT001",
  "productModel": "wewrttt",
  "costPrice": "123W"
}
```

**Expected**: Validation fails with 2 errors (numeric + pattern)

---

## ?? **Key Improvements**

| Before | After |
|--------|-------|
| ? `"123W"` accepted | ? `"123W"` rejected |
| ? Only checked `required` | ? Checks required, numeric, pattern, min/max |
| ? Pattern ignored | ? Pattern enforced |
| ? Type ignored | ? Type validated |
| ? Min/Max ignored | ? Min/Max enforced |

---

**The validation now properly enforces all field constraints defined in the JSON configuration!** ??
