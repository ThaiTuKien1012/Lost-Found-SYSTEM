using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace LostAndFound.Api.Filters
{
    public class FileUploadOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            // Check if action has [Consumes("multipart/form-data")]
            var consumesAttribute = context.MethodInfo.GetCustomAttributes(typeof(ConsumesAttribute), false)
                .Cast<ConsumesAttribute>()
                .FirstOrDefault();

            if (consumesAttribute != null && consumesAttribute.ContentTypes.Contains("multipart/form-data"))
            {
                // Get DTO parameter - try multiple ways to find it
                var dtoParameter = context.MethodInfo.GetParameters()
                    .FirstOrDefault(p => p.ParameterType.Name.Contains("Dto") && 
                                         (p.GetCustomAttributes(typeof(FromFormAttribute), false).Any() ||
                                          p.GetCustomAttributes(typeof(FromFormAttribute), true).Any()));

                var properties = new Dictionary<string, OpenApiSchema>();

                // Add DTO properties
                if (dtoParameter != null)
                {
                    var dtoType = dtoParameter.ParameterType;
                    var schemaRepository = context.SchemaRepository;
                    var schema = context.SchemaGenerator.GenerateSchema(dtoType, schemaRepository);

                    if (schema.Properties != null && schema.Properties.Any())
                    {
                        foreach (var property in schema.Properties)
                        {
                            var propertyName = property.Key;
                            // Convert property name to camelCase for form data
                            var formFieldName = char.ToLowerInvariant(propertyName[0]) + propertyName.Substring(1);
                            properties[formFieldName] = property.Value;
                        }
                    }
                    else
                    {
                        // Fallback: manually add properties if schema generation fails
                        var dtoProperties = dtoType.GetProperties();
                        foreach (var prop in dtoProperties)
                        {
                            var formFieldName = char.ToLowerInvariant(prop.Name[0]) + prop.Name.Substring(1);
                            var propType = prop.PropertyType;
                            
                            // Handle nullable types
                            var underlyingType = Nullable.GetUnderlyingType(propType) ?? propType;
                            
                            var propSchema = new OpenApiSchema();
                            if (underlyingType == typeof(int))
                            {
                                propSchema.Type = "integer";
                                propSchema.Format = "int32";
                            }
                            else if (underlyingType == typeof(string))
                            {
                                propSchema.Type = "string";
                            }
                            else if (underlyingType == typeof(DateTime))
                            {
                                propSchema.Type = "string";
                                propSchema.Format = "date-time";
                            }
                            else
                            {
                                propSchema.Type = "string";
                            }
                            
                            properties[formFieldName] = propSchema;
                        }
                    }
                }

                // Add file upload field
                properties["image"] = new OpenApiSchema
                {
                    Type = "string",
                    Format = "binary",
                    Description = "Image file (optional, max 5MB, formats: jpg, jpeg, png, gif, webp)"
                };

                // Clear existing parameters to avoid duplication
                operation.Parameters?.Clear();

                // Create or update RequestBody
                operation.RequestBody = new OpenApiRequestBody
                {
                    Content = new Dictionary<string, OpenApiMediaType>
                    {
                        ["multipart/form-data"] = new OpenApiMediaType
                        {
                            Schema = new OpenApiSchema
                            {
                                Type = "object",
                                Properties = properties,
                                Required = new HashSet<string> { "campusId", "itemCategoryId", "foundTime", "foundLocation" }
                            }
                        }
                    }
                };
            }
        }
    }

    // Filter to ignore IFormFile parameters during parameter generation
    public class FileUploadParameterFilter : IParameterFilter
    {
        public void Apply(OpenApiParameter parameter, ParameterFilterContext context)
        {
            var parameterInfo = context.ParameterInfo;
            if (parameterInfo != null)
            {
                var parameterType = parameterInfo.ParameterType;
                if (parameterType == typeof(IFormFile) || 
                    (parameterType.IsGenericType && 
                     parameterType.GetGenericTypeDefinition() == typeof(Nullable<>) &&
                     parameterType.GetGenericArguments()[0] == typeof(IFormFile)))
                {
                    // Mark as ignored - will be handled by OperationFilter
                    parameter.Description = "This parameter is handled by RequestBody";
                }
            }
        }
    }
}

