# NotificationsApi

All URIs are relative to *http://localhost:3000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**notificationsCancel**](#notificationscancel) | **PATCH** /api/v1/projects/{projectId}/notifications/{id}/cancel | Cancel a scheduled/recurring notification|
|[**notificationsGetById**](#notificationsgetbyid) | **GET** /api/v1/projects/{projectId}/notifications/{id} | Get notification by id|
|[**notificationsGetStats**](#notificationsgetstats) | **GET** /api/v1/projects/{projectId}/notifications/stats | |
|[**notificationsList**](#notificationslist) | **GET** /api/v1/projects/{projectId}/notifications | List notifications|
|[**notificationsSend**](#notificationssend) | **POST** /api/v1/projects/{projectId}/notifications/send | Send push notification|

# **notificationsCancel**
> notificationsCancel()


### Example

```typescript
import {
    NotificationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationsApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; // (default to undefined)
let id: string; // (default to undefined)

const { status, data } = await apiInstance.notificationsCancel(
    xAPIKey,
    projectId,
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] |  | defaults to undefined|
| **id** | [**string**] |  | defaults to undefined|


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
|**404** | Notification not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **notificationsGetById**
> notificationsGetById()


### Example

```typescript
import {
    NotificationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationsApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; // (default to undefined)
let id: string; // (default to undefined)

const { status, data } = await apiInstance.notificationsGetById(
    xAPIKey,
    projectId,
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] |  | defaults to undefined|
| **id** | [**string**] |  | defaults to undefined|


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
|**404** | Notification not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **notificationsGetStats**
> notificationsGetStats()


### Example

```typescript
import {
    NotificationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationsApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; // (default to undefined)
let days: string; // (default to undefined)

const { status, data } = await apiInstance.notificationsGetStats(
    xAPIKey,
    projectId,
    days
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] |  | defaults to undefined|
| **days** | [**string**] |  | defaults to undefined|


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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **notificationsList**
> NotificationsList200Response notificationsList()

Retrieves a paginated list of notifications with optional filtering by status and type.

### Example

```typescript
import {
    NotificationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationsApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)
let status: 'pending' | 'processing' | 'sent' | 'delivered' | 'failed' | 'cancelled'; //Filter by notification status (optional) (default to undefined)
let type: 'instant' | 'scheduled' | 'recurring'; //Filter by notification type (optional) (default to undefined)
let limit: number; //Number of notifications to return (max 100) (optional) (default to undefined)
let offset: number; //Number of notifications to skip (offset) (optional) (default to undefined)
let sortBy: string; // (optional) (default to undefined)
let sortOrder: 'asc' | 'desc'; // (optional) (default to undefined)

const { status, data } = await apiInstance.notificationsList(
    xAPIKey,
    projectId,
    status,
    type,
    limit,
    offset,
    sortBy,
    sortOrder
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|
| **status** | [**&#39;pending&#39; | &#39;processing&#39; | &#39;sent&#39; | &#39;delivered&#39; | &#39;failed&#39; | &#39;cancelled&#39;**]**Array<&#39;pending&#39; &#124; &#39;processing&#39; &#124; &#39;sent&#39; &#124; &#39;delivered&#39; &#124; &#39;failed&#39; &#124; &#39;cancelled&#39;>** | Filter by notification status | (optional) defaults to undefined|
| **type** | [**&#39;instant&#39; | &#39;scheduled&#39; | &#39;recurring&#39;**]**Array<&#39;instant&#39; &#124; &#39;scheduled&#39; &#124; &#39;recurring&#39;>** | Filter by notification type | (optional) defaults to undefined|
| **limit** | [**number**] | Number of notifications to return (max 100) | (optional) defaults to undefined|
| **offset** | [**number**] | Number of notifications to skip (offset) | (optional) defaults to undefined|
| **sortBy** | [**string**] |  | (optional) defaults to undefined|
| **sortOrder** | [**&#39;asc&#39; | &#39;desc&#39;**]**Array<&#39;asc&#39; &#124; &#39;desc&#39;>** |  | (optional) defaults to undefined|


### Return type

**NotificationsList200Response**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **notificationsSend**
> any notificationsSend(body)

       Sends a push notification to specified devices or user segments.       Supports multi-platform delivery (iOS, Android, Web) with platform-specific customization.       Rate limited to 100 requests per minute.     

### Example

```typescript
import {
    NotificationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationsApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)
let idempotencyKey: string; // (default to undefined)
let body: string; //Send payload (examples for instant and scheduled)

const { status, data } = await apiInstance.notificationsSend(
    xAPIKey,
    projectId,
    idempotencyKey,
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **string**| Send payload (examples for instant and scheduled) | |
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|
| **idempotencyKey** | [**string**] |  | defaults to undefined|


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
|**201** | Notification sent successfully |  -  |
|**400** | Invalid notification data |  -  |
|**429** | Rate limit exceeded |  * X-RateLimit-Limit - Request limit <br>  * X-RateLimit-Remaining - Remaining requests <br>  * X-RateLimit-Reset - Reset time <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

