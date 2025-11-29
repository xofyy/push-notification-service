# ProjectsApi

All URIs are relative to *http://localhost:3000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**projectsCreate**](#projectscreate) | **POST** /api/v1/projects | Create a new project|
|[**projectsFindOne**](#projectsfindone) | **GET** /api/v1/projects/{id} | Get project by ID|
|[**projectsGetCurrent**](#projectsgetcurrent) | **GET** /api/v1/projects | Get authenticated project|
|[**projectsRemove**](#projectsremove) | **DELETE** /api/v1/projects/{id} | Delete project|
|[**projectsRotateApiKey**](#projectsrotateapikey) | **POST** /api/v1/projects/{id}/regenerate-api-key | Regenerate API key|
|[**projectsUpdate**](#projectsupdate) | **PATCH** /api/v1/projects/{id} | Update project|

# **projectsCreate**
> any projectsCreate(body)

Creates a new push notification project with auto-generated API key and configuration.

### Example

```typescript
import {
    ProjectsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let body: any; //Project payload

const { status, data } = await apiInstance.projectsCreate(
    xAPIKey,
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **any**| Project payload | |
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|


### Return type

**any**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Project created successfully |  -  |
|**400** | Invalid input data |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **projectsFindOne**
> projectsFindOne()

Retrieves a specific project by ID. Users can only access their own project.

### Example

```typescript
import {
    ProjectsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let id: string; //Project ID (default to undefined)

const { status, data } = await apiInstance.projectsFindOne(
    xAPIKey,
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **id** | [**string**] | Project ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Project found and returned |  -  |
|**403** | Access denied - can only access own project |  -  |
|**404** | Project not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **projectsGetCurrent**
> any projectsGetCurrent()

Returns the project associated with the provided API key.

### Example

```typescript
import {
    ProjectsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)

const { status, data } = await apiInstance.projectsGetCurrent(
    xAPIKey
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|


### Return type

**any**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Project retrieved successfully |  -  |
|**401** | Invalid or missing API key |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **projectsRemove**
> projectsRemove()

Permanently deletes a project and all associated data. This action cannot be undone.

### Example

```typescript
import {
    ProjectsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let id: string; //Project ID to delete (default to undefined)

const { status, data } = await apiInstance.projectsRemove(
    xAPIKey,
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **id** | [**string**] | Project ID to delete | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | Project deleted successfully |  -  |
|**403** | Access denied - can only delete own project |  -  |
|**404** | Project not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **projectsRotateApiKey**
> any projectsRotateApiKey()

Generates a new API key for the project. The old API key will become invalid immediately.

### Example

```typescript
import {
    ProjectsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let id: string; //Project ID (default to undefined)

const { status, data } = await apiInstance.projectsRotateApiKey(
    xAPIKey,
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **id** | [**string**] | Project ID | defaults to undefined|


### Return type

**any**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | API key regenerated successfully |  -  |
|**403** | Access denied - can only regenerate API key for own project |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **projectsUpdate**
> projectsUpdate(body)

Updates project settings and configuration. Users can only update their own project.

### Example

```typescript
import {
    ProjectsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let id: string; //Project ID to update (default to undefined)
let body: object; //

const { status, data } = await apiInstance.projectsUpdate(
    xAPIKey,
    id,
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **object**|  | |
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **id** | [**string**] | Project ID to update | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Project updated successfully |  -  |
|**403** | Access denied - can only update own project |  -  |
|**404** | Project not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

