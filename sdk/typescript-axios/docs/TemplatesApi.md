# TemplatesApi

All URIs are relative to *http://localhost:3000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**templatesCreate**](#templatescreate) | **POST** /api/v1/projects/{projectId}/templates | Create a new notification template|
|[**templatesFindAll**](#templatesfindall) | **GET** /api/v1/projects/{projectId}/templates | Get all templates for a project|
|[**templatesFindByName**](#templatesfindbyname) | **GET** /api/v1/projects/{projectId}/templates/name/{name} | Get a specific template by name|
|[**templatesFindOne**](#templatesfindone) | **GET** /api/v1/projects/{projectId}/templates/{id} | Get a specific template by ID|
|[**templatesGetStatistics**](#templatesgetstatistics) | **GET** /api/v1/projects/{projectId}/templates/statistics | Get template usage statistics|
|[**templatesRemove**](#templatesremove) | **DELETE** /api/v1/projects/{projectId}/templates/{id} | Delete a template|
|[**templatesRender**](#templatesrender) | **POST** /api/v1/projects/{projectId}/templates/render | Render a template with variables|
|[**templatesUpdate**](#templatesupdate) | **PATCH** /api/v1/projects/{projectId}/templates/{id} | Update a template|
|[**templatesValidate**](#templatesvalidate) | **POST** /api/v1/projects/{projectId}/templates/validate | Validate template syntax and variables|

# **templatesCreate**
> templatesCreate(createTemplateDto)


### Example

```typescript
import {
    TemplatesApi,
    Configuration,
    CreateTemplateDto
} from './api';

const configuration = new Configuration();
const apiInstance = new TemplatesApi(configuration);

let projectId: string; //Project ID (default to undefined)
let createTemplateDto: CreateTemplateDto; //

const { status, data } = await apiInstance.templatesCreate(
    projectId,
    createTemplateDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createTemplateDto** | **CreateTemplateDto**|  | |
| **projectId** | [**string**] | Project ID | defaults to undefined|


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
|**201** | Template created successfully |  -  |
|**409** | Template with same name already exists |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templatesFindAll**
> templatesFindAll()


### Example

```typescript
import {
    TemplatesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TemplatesApi(configuration);

let projectId: string; //Project ID (default to undefined)
let status: 'active' | 'inactive'; // (optional) (default to undefined)
let language: string; //Filter by language (optional) (default to undefined)
let limit: number; //Limit number of results (optional) (default to undefined)
let offset: number; //Offset for pagination (optional) (default to undefined)

const { status, data } = await apiInstance.templatesFindAll(
    projectId,
    status,
    language,
    limit,
    offset
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **projectId** | [**string**] | Project ID | defaults to undefined|
| **status** | [**&#39;active&#39; | &#39;inactive&#39;**]**Array<&#39;active&#39; &#124; &#39;inactive&#39;>** |  | (optional) defaults to undefined|
| **language** | [**string**] | Filter by language | (optional) defaults to undefined|
| **limit** | [**number**] | Limit number of results | (optional) defaults to undefined|
| **offset** | [**number**] | Offset for pagination | (optional) defaults to undefined|


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
|**200** | Templates retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templatesFindByName**
> templatesFindByName()


### Example

```typescript
import {
    TemplatesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TemplatesApi(configuration);

let projectId: string; //Project ID (default to undefined)
let name: string; //Template name (default to undefined)

const { status, data } = await apiInstance.templatesFindByName(
    projectId,
    name
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **projectId** | [**string**] | Project ID | defaults to undefined|
| **name** | [**string**] | Template name | defaults to undefined|


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
|**200** | Template retrieved successfully |  -  |
|**404** | Template not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templatesFindOne**
> templatesFindOne()


### Example

```typescript
import {
    TemplatesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TemplatesApi(configuration);

let projectId: string; //Project ID (default to undefined)
let id: string; //Template ID (default to undefined)

const { status, data } = await apiInstance.templatesFindOne(
    projectId,
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **projectId** | [**string**] | Project ID | defaults to undefined|
| **id** | [**string**] | Template ID | defaults to undefined|


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
|**200** | Template retrieved successfully |  -  |
|**404** | Template not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templatesGetStatistics**
> templatesGetStatistics()


### Example

```typescript
import {
    TemplatesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TemplatesApi(configuration);

let projectId: string; //Project ID (default to undefined)

const { status, data } = await apiInstance.templatesGetStatistics(
    projectId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **projectId** | [**string**] | Project ID | defaults to undefined|


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
|**200** | Statistics retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templatesRemove**
> templatesRemove()


### Example

```typescript
import {
    TemplatesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TemplatesApi(configuration);

let projectId: string; //Project ID (default to undefined)
let id: string; //Template ID (default to undefined)

const { status, data } = await apiInstance.templatesRemove(
    projectId,
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **projectId** | [**string**] | Project ID | defaults to undefined|
| **id** | [**string**] | Template ID | defaults to undefined|


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
|**200** | Template deleted successfully |  -  |
|**404** | Template not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templatesRender**
> templatesRender(renderTemplateDto)


### Example

```typescript
import {
    TemplatesApi,
    Configuration,
    RenderTemplateDto
} from './api';

const configuration = new Configuration();
const apiInstance = new TemplatesApi(configuration);

let projectId: string; //Project ID (default to undefined)
let renderTemplateDto: RenderTemplateDto; //

const { status, data } = await apiInstance.templatesRender(
    projectId,
    renderTemplateDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **renderTemplateDto** | **RenderTemplateDto**|  | |
| **projectId** | [**string**] | Project ID | defaults to undefined|


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
|**200** | Template rendered successfully |  -  |
|**400** | Template validation failed |  -  |
|**404** | Template not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templatesUpdate**
> templatesUpdate(updateTemplateDto)


### Example

```typescript
import {
    TemplatesApi,
    Configuration,
    UpdateTemplateDto
} from './api';

const configuration = new Configuration();
const apiInstance = new TemplatesApi(configuration);

let projectId: string; //Project ID (default to undefined)
let id: string; //Template ID (default to undefined)
let updateTemplateDto: UpdateTemplateDto; //

const { status, data } = await apiInstance.templatesUpdate(
    projectId,
    id,
    updateTemplateDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateTemplateDto** | **UpdateTemplateDto**|  | |
| **projectId** | [**string**] | Project ID | defaults to undefined|
| **id** | [**string**] | Template ID | defaults to undefined|


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
|**200** | Template updated successfully |  -  |
|**404** | Template not found |  -  |
|**409** | Template with same name already exists |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templatesValidate**
> templatesValidate(validateTemplateDto)


### Example

```typescript
import {
    TemplatesApi,
    Configuration,
    ValidateTemplateDto
} from './api';

const configuration = new Configuration();
const apiInstance = new TemplatesApi(configuration);

let projectId: string; //Project ID (default to undefined)
let validateTemplateDto: ValidateTemplateDto; //

const { status, data } = await apiInstance.templatesValidate(
    projectId,
    validateTemplateDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **validateTemplateDto** | **ValidateTemplateDto**|  | |
| **projectId** | [**string**] | Project ID | defaults to undefined|


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
|**200** | Template validated successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

