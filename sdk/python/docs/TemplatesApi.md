# openapi_client.TemplatesApi

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**templates_create**](TemplatesApi.md#templates_create) | **POST** /api/v1/projects/{projectId}/templates | Create a new notification template
[**templates_find_all**](TemplatesApi.md#templates_find_all) | **GET** /api/v1/projects/{projectId}/templates | Get all templates for a project
[**templates_find_by_name**](TemplatesApi.md#templates_find_by_name) | **GET** /api/v1/projects/{projectId}/templates/name/{name} | Get a specific template by name
[**templates_find_one**](TemplatesApi.md#templates_find_one) | **GET** /api/v1/projects/{projectId}/templates/{id} | Get a specific template by ID
[**templates_get_statistics**](TemplatesApi.md#templates_get_statistics) | **GET** /api/v1/projects/{projectId}/templates/statistics | Get template usage statistics
[**templates_remove**](TemplatesApi.md#templates_remove) | **DELETE** /api/v1/projects/{projectId}/templates/{id} | Delete a template
[**templates_render**](TemplatesApi.md#templates_render) | **POST** /api/v1/projects/{projectId}/templates/render | Render a template with variables
[**templates_update**](TemplatesApi.md#templates_update) | **PATCH** /api/v1/projects/{projectId}/templates/{id} | Update a template
[**templates_validate**](TemplatesApi.md#templates_validate) | **POST** /api/v1/projects/{projectId}/templates/validate | Validate template syntax and variables


# **templates_create**
> templates_create(project_id, create_template_dto)

Create a new notification template

### Example


```python
import openapi_client
from openapi_client.models.create_template_dto import CreateTemplateDto
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost:3000"
)


# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.TemplatesApi(api_client)
    project_id = 'project_id_example' # str | Project ID
    create_template_dto = openapi_client.CreateTemplateDto() # CreateTemplateDto | 

    try:
        # Create a new notification template
        api_instance.templates_create(project_id, create_template_dto)
    except Exception as e:
        print("Exception when calling TemplatesApi->templates_create: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_id** | **str**| Project ID | 
 **create_template_dto** | [**CreateTemplateDto**](CreateTemplateDto.md)|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** | Template created successfully |  -  |
**409** | Template with same name already exists |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templates_find_all**
> templates_find_all(project_id, status=status, language=language, limit=limit, offset=offset)

Get all templates for a project

### Example


```python
import openapi_client
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost:3000"
)


# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.TemplatesApi(api_client)
    project_id = 'project_id_example' # str | Project ID
    status = 'status_example' # str |  (optional)
    language = 'language_example' # str | Filter by language (optional)
    limit = 3.4 # float | Limit number of results (optional)
    offset = 3.4 # float | Offset for pagination (optional)

    try:
        # Get all templates for a project
        api_instance.templates_find_all(project_id, status=status, language=language, limit=limit, offset=offset)
    except Exception as e:
        print("Exception when calling TemplatesApi->templates_find_all: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_id** | **str**| Project ID | 
 **status** | **str**|  | [optional] 
 **language** | **str**| Filter by language | [optional] 
 **limit** | **float**| Limit number of results | [optional] 
 **offset** | **float**| Offset for pagination | [optional] 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Templates retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templates_find_by_name**
> templates_find_by_name(project_id, name)

Get a specific template by name

### Example


```python
import openapi_client
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost:3000"
)


# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.TemplatesApi(api_client)
    project_id = 'project_id_example' # str | Project ID
    name = 'name_example' # str | Template name

    try:
        # Get a specific template by name
        api_instance.templates_find_by_name(project_id, name)
    except Exception as e:
        print("Exception when calling TemplatesApi->templates_find_by_name: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_id** | **str**| Project ID | 
 **name** | **str**| Template name | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Template retrieved successfully |  -  |
**404** | Template not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templates_find_one**
> templates_find_one(project_id, id)

Get a specific template by ID

### Example


```python
import openapi_client
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost:3000"
)


# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.TemplatesApi(api_client)
    project_id = 'project_id_example' # str | Project ID
    id = 'id_example' # str | Template ID

    try:
        # Get a specific template by ID
        api_instance.templates_find_one(project_id, id)
    except Exception as e:
        print("Exception when calling TemplatesApi->templates_find_one: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_id** | **str**| Project ID | 
 **id** | **str**| Template ID | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Template retrieved successfully |  -  |
**404** | Template not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templates_get_statistics**
> templates_get_statistics(project_id)

Get template usage statistics

### Example


```python
import openapi_client
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost:3000"
)


# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.TemplatesApi(api_client)
    project_id = 'project_id_example' # str | Project ID

    try:
        # Get template usage statistics
        api_instance.templates_get_statistics(project_id)
    except Exception as e:
        print("Exception when calling TemplatesApi->templates_get_statistics: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_id** | **str**| Project ID | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Statistics retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templates_remove**
> templates_remove(project_id, id)

Delete a template

### Example


```python
import openapi_client
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost:3000"
)


# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.TemplatesApi(api_client)
    project_id = 'project_id_example' # str | Project ID
    id = 'id_example' # str | Template ID

    try:
        # Delete a template
        api_instance.templates_remove(project_id, id)
    except Exception as e:
        print("Exception when calling TemplatesApi->templates_remove: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_id** | **str**| Project ID | 
 **id** | **str**| Template ID | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Template deleted successfully |  -  |
**404** | Template not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templates_render**
> templates_render(project_id, render_template_dto)

Render a template with variables

### Example


```python
import openapi_client
from openapi_client.models.render_template_dto import RenderTemplateDto
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost:3000"
)


# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.TemplatesApi(api_client)
    project_id = 'project_id_example' # str | Project ID
    render_template_dto = openapi_client.RenderTemplateDto() # RenderTemplateDto | 

    try:
        # Render a template with variables
        api_instance.templates_render(project_id, render_template_dto)
    except Exception as e:
        print("Exception when calling TemplatesApi->templates_render: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_id** | **str**| Project ID | 
 **render_template_dto** | [**RenderTemplateDto**](RenderTemplateDto.md)|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Template rendered successfully |  -  |
**400** | Template validation failed |  -  |
**404** | Template not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templates_update**
> templates_update(project_id, id, update_template_dto)

Update a template

### Example


```python
import openapi_client
from openapi_client.models.update_template_dto import UpdateTemplateDto
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost:3000"
)


# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.TemplatesApi(api_client)
    project_id = 'project_id_example' # str | Project ID
    id = 'id_example' # str | Template ID
    update_template_dto = openapi_client.UpdateTemplateDto() # UpdateTemplateDto | 

    try:
        # Update a template
        api_instance.templates_update(project_id, id, update_template_dto)
    except Exception as e:
        print("Exception when calling TemplatesApi->templates_update: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_id** | **str**| Project ID | 
 **id** | **str**| Template ID | 
 **update_template_dto** | [**UpdateTemplateDto**](UpdateTemplateDto.md)|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Template updated successfully |  -  |
**404** | Template not found |  -  |
**409** | Template with same name already exists |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templates_validate**
> templates_validate(project_id, validate_template_dto)

Validate template syntax and variables

### Example


```python
import openapi_client
from openapi_client.models.validate_template_dto import ValidateTemplateDto
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost:3000"
)


# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.TemplatesApi(api_client)
    project_id = 'project_id_example' # str | Project ID
    validate_template_dto = openapi_client.ValidateTemplateDto() # ValidateTemplateDto | 

    try:
        # Validate template syntax and variables
        api_instance.templates_validate(project_id, validate_template_dto)
    except Exception as e:
        print("Exception when calling TemplatesApi->templates_validate: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_id** | **str**| Project ID | 
 **validate_template_dto** | [**ValidateTemplateDto**](ValidateTemplateDto.md)|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Template validated successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

