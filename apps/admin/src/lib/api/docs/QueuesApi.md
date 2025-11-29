# QueuesApi

All URIs are relative to *http://localhost:3000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**queuesAddJob**](#queuesaddjob) | **POST** /api/v1/projects/{projectId}/queues/jobs | |
|[**queuesCancelJob**](#queuescanceljob) | **DELETE** /api/v1/projects/{projectId}/queues/jobs/{queueName}/{jobId} | |
|[**queuesGetHealthStatus**](#queuesgethealthstatus) | **GET** /api/v1/projects/{projectId}/queues/health | |
|[**queuesGetJobStatus**](#queuesgetjobstatus) | **GET** /api/v1/projects/{projectId}/queues/jobs/{queueName}/{jobId}/status | |
|[**queuesGetQueueStats**](#queuesgetqueuestats) | **GET** /api/v1/projects/{projectId}/queues/stats | |
|[**queuesPauseQueue**](#queuespausequeue) | **POST** /api/v1/projects/{projectId}/queues/{queueName}/pause | |
|[**queuesResumeQueue**](#queuesresumequeue) | **POST** /api/v1/projects/{projectId}/queues/{queueName}/resume | |

# **queuesAddJob**
> queuesAddJob()


### Example

```typescript
import {
    QueuesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new QueuesApi(configuration);

let projectId: string; // (default to undefined)

const { status, data } = await apiInstance.queuesAddJob(
    projectId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **projectId** | [**string**] |  | defaults to undefined|


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
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **queuesCancelJob**
> queuesCancelJob()


### Example

```typescript
import {
    QueuesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new QueuesApi(configuration);

let projectId: string; // (default to undefined)
let queueName: string; // (default to undefined)
let jobId: string; // (default to undefined)

const { status, data } = await apiInstance.queuesCancelJob(
    projectId,
    queueName,
    jobId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **projectId** | [**string**] |  | defaults to undefined|
| **queueName** | [**string**] |  | defaults to undefined|
| **jobId** | [**string**] |  | defaults to undefined|


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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **queuesGetHealthStatus**
> queuesGetHealthStatus()


### Example

```typescript
import {
    QueuesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new QueuesApi(configuration);

let projectId: string; // (default to undefined)

const { status, data } = await apiInstance.queuesGetHealthStatus(
    projectId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **projectId** | [**string**] |  | defaults to undefined|


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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **queuesGetJobStatus**
> queuesGetJobStatus()


### Example

```typescript
import {
    QueuesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new QueuesApi(configuration);

let projectId: string; // (default to undefined)
let queueName: string; // (default to undefined)
let jobId: string; // (default to undefined)

const { status, data } = await apiInstance.queuesGetJobStatus(
    projectId,
    queueName,
    jobId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **projectId** | [**string**] |  | defaults to undefined|
| **queueName** | [**string**] |  | defaults to undefined|
| **jobId** | [**string**] |  | defaults to undefined|


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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **queuesGetQueueStats**
> queuesGetQueueStats()


### Example

```typescript
import {
    QueuesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new QueuesApi(configuration);

let projectId: string; // (default to undefined)
let queue: string; // (default to undefined)

const { status, data } = await apiInstance.queuesGetQueueStats(
    projectId,
    queue
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **projectId** | [**string**] |  | defaults to undefined|
| **queue** | [**string**] |  | defaults to undefined|


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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **queuesPauseQueue**
> queuesPauseQueue()


### Example

```typescript
import {
    QueuesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new QueuesApi(configuration);

let projectId: string; // (default to undefined)
let queueName: string; // (default to undefined)

const { status, data } = await apiInstance.queuesPauseQueue(
    projectId,
    queueName
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **projectId** | [**string**] |  | defaults to undefined|
| **queueName** | [**string**] |  | defaults to undefined|


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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **queuesResumeQueue**
> queuesResumeQueue()


### Example

```typescript
import {
    QueuesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new QueuesApi(configuration);

let projectId: string; // (default to undefined)
let queueName: string; // (default to undefined)

const { status, data } = await apiInstance.queuesResumeQueue(
    projectId,
    queueName
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **projectId** | [**string**] |  | defaults to undefined|
| **queueName** | [**string**] |  | defaults to undefined|


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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

