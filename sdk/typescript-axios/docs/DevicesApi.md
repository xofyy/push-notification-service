# DevicesApi

All URIs are relative to *http://localhost:3000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**devicesAddTags**](#devicesaddtags) | **POST** /api/v1/projects/{projectId}/devices/{id}/tags | |
|[**devicesAddToTopic**](#devicesaddtotopic) | **POST** /api/v1/projects/{projectId}/devices/{id}/topics/{topic} | |
|[**devicesCleanupTokens**](#devicescleanuptokens) | **POST** /api/v1/projects/{projectId}/devices/cleanup-tokens | |
|[**devicesCountDevicesBySegment**](#devicescountdevicesbysegment) | **POST** /api/v1/projects/{projectId}/devices/segment/count | |
|[**devicesFindAll**](#devicesfindall) | **GET** /api/v1/projects/{projectId}/devices | |
|[**devicesFindOne**](#devicesfindone) | **GET** /api/v1/projects/{projectId}/devices/{id} | |
|[**devicesGetProjectTags**](#devicesgetprojecttags) | **GET** /api/v1/projects/{projectId}/devices/tags | |
|[**devicesGetPropertyStats**](#devicesgetpropertystats) | **GET** /api/v1/projects/{projectId}/devices/properties/stats | |
|[**devicesGetStats**](#devicesgetstats) | **GET** /api/v1/projects/{projectId}/devices/stats | |
|[**devicesGetTagStats**](#devicesgettagstats) | **GET** /api/v1/projects/{projectId}/devices/tags/stats | |
|[**devicesGetTokensBySegment**](#devicesgettokensbysegment) | **POST** /api/v1/projects/{projectId}/devices/segment/tokens | |
|[**devicesQueryDevicesBySegment**](#devicesquerydevicesbysegment) | **POST** /api/v1/projects/{projectId}/devices/segment/query | |
|[**devicesRefreshToken**](#devicesrefreshtoken) | **POST** /api/v1/projects/{projectId}/devices/refresh-token | |
|[**devicesRegister**](#devicesregister) | **POST** /api/v1/projects/{projectId}/devices/register | Register device|
|[**devicesRegisterBasic**](#devicesregisterbasic) | **POST** /api/v1/projects/{projectId}/devices/register/basic | |
|[**devicesRemove**](#devicesremove) | **DELETE** /api/v1/projects/{projectId}/devices/{id} | |
|[**devicesRemoveFromTopic**](#devicesremovefromtopic) | **DELETE** /api/v1/projects/{projectId}/devices/{id}/topics/{topic} | |
|[**devicesRemoveProperties**](#devicesremoveproperties) | **DELETE** /api/v1/projects/{projectId}/devices/{id}/properties | |
|[**devicesRemoveTags**](#devicesremovetags) | **DELETE** /api/v1/projects/{projectId}/devices/{id}/tags | |
|[**devicesSetProperties**](#devicessetproperties) | **PUT** /api/v1/projects/{projectId}/devices/{id}/properties | |
|[**devicesTestSegmentQuery**](#devicestestsegmentquery) | **POST** /api/v1/projects/{projectId}/devices/segment/test | |
|[**devicesUpdate**](#devicesupdate) | **PATCH** /api/v1/projects/{projectId}/devices/{id} | |
|[**devicesUpdateProperties**](#devicesupdateproperties) | **PATCH** /api/v1/projects/{projectId}/devices/{id}/properties | |
|[**devicesUpdateToken**](#devicesupdatetoken) | **PATCH** /api/v1/projects/{projectId}/devices/{id}/token | |
|[**devicesValidateToken**](#devicesvalidatetoken) | **POST** /api/v1/projects/{projectId}/devices/validate-token | Validate device token|
|[**devicesValidateTokensBatch**](#devicesvalidatetokensbatch) | **POST** /api/v1/projects/{projectId}/devices/validate-tokens-batch | |

# **devicesAddTags**
> devicesAddTags()


### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)
let id: string; // (default to undefined)

const { status, data } = await apiInstance.devicesAddTags(
    xAPIKey,
    projectId,
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|
| **id** | [**string**] |  | defaults to undefined|


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
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **devicesAddToTopic**
> devicesAddToTopic()


### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)
let id: string; // (default to undefined)
let topic: string; // (default to undefined)

const { status, data } = await apiInstance.devicesAddToTopic(
    xAPIKey,
    projectId,
    id,
    topic
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|
| **id** | [**string**] |  | defaults to undefined|
| **topic** | [**string**] |  | defaults to undefined|


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
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **devicesCleanupTokens**
> devicesCleanupTokens()


### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)
let dryRun: string; // (default to undefined)

const { status, data } = await apiInstance.devicesCleanupTokens(
    xAPIKey,
    projectId,
    dryRun
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|
| **dryRun** | [**string**] |  | defaults to undefined|


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

# **devicesCountDevicesBySegment**
> devicesCountDevicesBySegment(body)


### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)
let body: object; //

const { status, data } = await apiInstance.devicesCountDevicesBySegment(
    xAPIKey,
    projectId,
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **object**|  | |
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|


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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **devicesFindAll**
> devicesFindAll()


### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)
let platform: string; // (default to undefined)
let userId: string; // (default to undefined)
let tags: string; // (default to undefined)
let topics: string; // (default to undefined)
let isActive: string; // (default to undefined)

const { status, data } = await apiInstance.devicesFindAll(
    xAPIKey,
    projectId,
    platform,
    userId,
    tags,
    topics,
    isActive
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|
| **platform** | [**string**] |  | defaults to undefined|
| **userId** | [**string**] |  | defaults to undefined|
| **tags** | [**string**] |  | defaults to undefined|
| **topics** | [**string**] |  | defaults to undefined|
| **isActive** | [**string**] |  | defaults to undefined|


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

# **devicesFindOne**
> devicesFindOne()


### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)
let id: string; // (default to undefined)

const { status, data } = await apiInstance.devicesFindOne(
    xAPIKey,
    projectId,
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|
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
|**404** | Device not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **devicesGetProjectTags**
> devicesGetProjectTags()


### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)

const { status, data } = await apiInstance.devicesGetProjectTags(
    xAPIKey,
    projectId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|


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

# **devicesGetPropertyStats**
> devicesGetPropertyStats()


### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)

const { status, data } = await apiInstance.devicesGetPropertyStats(
    xAPIKey,
    projectId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|


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

# **devicesGetStats**
> devicesGetStats()


### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)

const { status, data } = await apiInstance.devicesGetStats(
    xAPIKey,
    projectId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|


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

# **devicesGetTagStats**
> devicesGetTagStats()


### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)

const { status, data } = await apiInstance.devicesGetTagStats(
    xAPIKey,
    projectId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|


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

# **devicesGetTokensBySegment**
> devicesGetTokensBySegment(body)


### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)
let body: object; //

const { status, data } = await apiInstance.devicesGetTokensBySegment(
    xAPIKey,
    projectId,
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **object**|  | |
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|


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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **devicesQueryDevicesBySegment**
> devicesQueryDevicesBySegment(body)


### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)
let body: object; //

const { status, data } = await apiInstance.devicesQueryDevicesBySegment(
    xAPIKey,
    projectId,
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **object**|  | |
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|


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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **devicesRefreshToken**
> devicesRefreshToken()


### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)

const { status, data } = await apiInstance.devicesRefreshToken(
    xAPIKey,
    projectId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|


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

# **devicesRegister**
> any devicesRegister(body)

       Registers a new device for push notifications with enhanced validation.       Automatically detects platform and validates device tokens.       Rate limited to 100 requests per minute.     

### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)
let body: any; //Device registration payload

const { status, data } = await apiInstance.devicesRegister(
    xAPIKey,
    projectId,
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **any**| Device registration payload | |
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|


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
|**201** | Device registered successfully |  -  |
|**400** | Invalid device data or token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **devicesRegisterBasic**
> devicesRegisterBasic(body)


### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)
let body: object; //

const { status, data } = await apiInstance.devicesRegisterBasic(
    xAPIKey,
    projectId,
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **object**|  | |
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|


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
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **devicesRemove**
> devicesRemove()


### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)
let id: string; // (default to undefined)

const { status, data } = await apiInstance.devicesRemove(
    xAPIKey,
    projectId,
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|
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
|**404** | Device not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **devicesRemoveFromTopic**
> devicesRemoveFromTopic()


### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)
let id: string; // (default to undefined)
let topic: string; // (default to undefined)

const { status, data } = await apiInstance.devicesRemoveFromTopic(
    xAPIKey,
    projectId,
    id,
    topic
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|
| **id** | [**string**] |  | defaults to undefined|
| **topic** | [**string**] |  | defaults to undefined|


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
|**204** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **devicesRemoveProperties**
> devicesRemoveProperties()


### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)
let id: string; // (default to undefined)

const { status, data } = await apiInstance.devicesRemoveProperties(
    xAPIKey,
    projectId,
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|
| **id** | [**string**] |  | defaults to undefined|


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

# **devicesRemoveTags**
> devicesRemoveTags()


### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)
let id: string; // (default to undefined)

const { status, data } = await apiInstance.devicesRemoveTags(
    xAPIKey,
    projectId,
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|
| **id** | [**string**] |  | defaults to undefined|


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

# **devicesSetProperties**
> devicesSetProperties()


### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)
let id: string; // (default to undefined)

const { status, data } = await apiInstance.devicesSetProperties(
    xAPIKey,
    projectId,
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|
| **id** | [**string**] |  | defaults to undefined|


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

# **devicesTestSegmentQuery**
> devicesTestSegmentQuery(body)


### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)
let body: object; //

const { status, data } = await apiInstance.devicesTestSegmentQuery(
    xAPIKey,
    projectId,
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **object**|  | |
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|


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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **devicesUpdate**
> devicesUpdate(body)


### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)
let id: string; // (default to undefined)
let body: object; //

const { status, data } = await apiInstance.devicesUpdate(
    xAPIKey,
    projectId,
    id,
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **object**|  | |
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**404** | Device not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **devicesUpdateProperties**
> devicesUpdateProperties()


### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)
let id: string; // (default to undefined)

const { status, data } = await apiInstance.devicesUpdateProperties(
    xAPIKey,
    projectId,
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|
| **id** | [**string**] |  | defaults to undefined|


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

# **devicesUpdateToken**
> devicesUpdateToken()


### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: string; //Project ID (default to undefined)
let id: string; // (default to undefined)

const { status, data } = await apiInstance.devicesUpdateToken(
    xAPIKey,
    projectId,
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | [**string**] | Project ID | defaults to undefined|
| **id** | [**string**] |  | defaults to undefined|


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

# **devicesValidateToken**
> any devicesValidateToken()

       Validates a device token for a specific platform.       Checks token format and verifies with the respective push service.       Rate limited to 10 requests per minute due to external API calls.     

### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: any; //Project ID (default to undefined)

const { status, data } = await apiInstance.devicesValidateToken(
    xAPIKey,
    projectId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | **any** | Project ID | defaults to undefined|


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
|**200** | Token validation result |  -  |
|**400** | Invalid token format |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **devicesValidateTokensBatch**
> devicesValidateTokensBatch()


### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let xAPIKey: string; //API Key for authentication (default to undefined)
let projectId: any; //Project ID (default to undefined)

const { status, data } = await apiInstance.devicesValidateTokensBatch(
    xAPIKey,
    projectId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xAPIKey** | [**string**] | API Key for authentication | defaults to undefined|
| **projectId** | **any** | Project ID | defaults to undefined|


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

