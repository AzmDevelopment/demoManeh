using System.Text.Json;
using backend.Models;

namespace backend.Services;

public class FileSystemWorkflowDefinitionProvider : IWorkflowDefinitionProvider
{
    private readonly string _workflowBasePath;
    private readonly ILogger<FileSystemWorkflowDefinitionProvider> _logger;
    private readonly JsonSerializerOptions _jsonOptions;

    public FileSystemWorkflowDefinitionProvider(
        IConfiguration configuration,
        ILogger<FileSystemWorkflowDefinitionProvider> logger)
    {
        _logger = logger;
        
        // Get base path from configuration
        var configuredPath = configuration["WorkflowEngine:BasePath"];
        
        if (!string.IsNullOrEmpty(configuredPath))
        {
            // Use configured path - could be absolute or relative
            _workflowBasePath = Path.IsPathRooted(configuredPath) 
                ? configuredPath 
                : Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), configuredPath));
        }
        else
        {
            // Default: Navigate from bin/Debug/net9.0 to frontend directory
            // Current: C:\work\Azm\Maneh\demo\demoManeh\backendsln\backend\bin\Debug\net9.0
            // Target:  C:\work\Azm\Maneh\demo\demoManeh\frontend\src\assets\forms\workflows
            var currentDir = Directory.GetCurrentDirectory();
            _workflowBasePath = Path.GetFullPath(Path.Combine(currentDir, "..", "..", "..", "..", "..", "frontend", "src", "assets", "forms", "workflows"));
        }
        
        _logger.LogInformation("Workflow base path configured: {BasePath}", _workflowBasePath);
        
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    public async Task<WorkflowDefinition?> GetDefinitionAsync(string certificationId)
    {
        try
        {
            var definitionPath = Path.Combine(_workflowBasePath, "Definitions", $"{certificationId}.json");
            
            _logger.LogDebug("Looking for workflow definition at: {Path}", definitionPath);
            
            if (!File.Exists(definitionPath))
            {
                _logger.LogWarning("Workflow definition not found: {Path}", definitionPath);
                return null;
            }

            var json = await File.ReadAllTextAsync(definitionPath);
            var definition = JsonSerializer.Deserialize<WorkflowDefinition>(json, _jsonOptions);
            
            _logger.LogInformation("Successfully loaded workflow definition: {CertificationId}", certificationId);
            return definition;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading workflow definition for {CertificationId}", certificationId);
            return null;
        }
    }

    public async Task<WorkflowStep?> GetStepDefinitionAsync(string stepRef)
    {
        try
        {
            // stepRef format: "workflows/Steps/certificate_specific/CT401_new/CT401_step1_data_entry"
            // Need to convert to file path
            var stepPath = stepRef.Replace("workflows/", "")
                                 .Replace("/", Path.DirectorySeparatorChar.ToString());
            var fullPath = Path.Combine(_workflowBasePath, stepPath + ".json");

            _logger.LogDebug("Looking for step definition at: {Path}", fullPath);
            _logger.LogDebug("Step reference: {StepRef}", stepRef);
            _logger.LogDebug("Base path: {BasePath}", _workflowBasePath);
            
            if (!File.Exists(fullPath))
            {
                _logger.LogWarning("Step definition not found: {Path}", fullPath);
                
                // Try to help diagnose the issue
                var directory = Path.GetDirectoryName(fullPath);
                if (Directory.Exists(directory))
                {
                    _logger.LogWarning("Directory exists but file not found. Files in directory:");
                    var filesInDir = Directory.GetFiles(directory, "*.json");
                    foreach (var file in filesInDir)
                    {
                        _logger.LogWarning("  - {FileName}", Path.GetFileName(file));
                    }
                }
                else
                {
                    _logger.LogWarning("Directory does not exist: {Directory}", directory);
                }
                
                return null;
            }

            var json = await File.ReadAllTextAsync(fullPath);
            var step = JsonSerializer.Deserialize<WorkflowStep>(json, _jsonOptions);
            
            _logger.LogInformation("Successfully loaded step definition: {StepRef}", stepRef);
            return step;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading step definition for {StepRef}", stepRef);
            return null;
        }
    }

    public async Task<List<WorkflowDefinition>> GetAllDefinitionsAsync()
    {
        try
        {
            var definitions = new List<WorkflowDefinition>();
            var definitionsPath = Path.Combine(_workflowBasePath, "Definitions");

            _logger.LogDebug("Looking for definitions directory at: {Path}", definitionsPath);
            
            if (!Directory.Exists(definitionsPath))
            {
                _logger.LogWarning("Definitions directory not found: {Path}", definitionsPath);
                _logger.LogWarning("Current directory: {CurrentDir}", Directory.GetCurrentDirectory());
                _logger.LogWarning("Configured base path: {BasePath}", _workflowBasePath);
                return definitions;
            }

            var files = Directory.GetFiles(definitionsPath, "*.json");
            _logger.LogInformation("Found {Count} workflow definition files", files.Length);

            foreach (var file in files)
            {
                try
                {
                    var json = await File.ReadAllTextAsync(file);
                    var definition = JsonSerializer.Deserialize<WorkflowDefinition>(json, _jsonOptions);
                    if (definition != null)
                    {
                        definitions.Add(definition);
                        _logger.LogDebug("Loaded workflow definition from: {File}", Path.GetFileName(file));
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error loading workflow definition from file: {File}", file);
                }
            }

            return definitions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading workflow definitions");
            return new List<WorkflowDefinition>();
        }
    }
}
