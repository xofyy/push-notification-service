# AnalyticsApi

All URIs are relative to *http://localhost:3000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**analyticsExport**](#analyticsexport) | **GET** /api/v1/projects/{projectId}/analytics/export | Export analytics data|
|[**analyticsGetEngagementMetrics**](#analyticsgetengagementmetrics) | **GET** /api/v1/projects/{projectId}/analytics/engagement | Get user engagement metrics|
|[**analyticsGetEvents**](#analyticsgetevents) | **GET** /api/v1/projects/{projectId}/analytics/events | Get analytics events with filtering and pagination|
|[**analyticsGetNotificationAnalytics**](#analyticsgetnotificationanalytics) | **GET** /api/v1/projects/{projectId}/analytics/notifications | Get notification analytics and performance metrics|
|[**analyticsGetNotificationFunnel**](#analyticsgetnotificationfunnel) | **GET** /api/v1/projects/{projectId}/analytics/notifications/funnel | Get notification conversion funnel|
|[**analyticsGetPerformanceMetrics**](#analyticsgetperformancemetrics) | **GET** /api/v1/projects/{projectId}/analytics/performance | Get system performance metrics|
|[**analyticsGetRealTimeData**](#analyticsgetrealtimedata) | **GET** /api/v1/projects/{projectId}/analytics/realtime | Get real-time analytics dashboard data|
|[**analyticsOverview**](#analyticsoverview) | **GET** /api/v1/projects/{projectId}/analytics/overview | Get project analytics overview|
|[**analyticsRealtimeSSE**](#analyticsrealtimesse) | **GET** /api/v1/projects/{projectId}/analytics/realtime-sse | Server-Sent Events for real-time analytics (last hour, updates every 30s)|
|[**analyticsTrackBatch**](#analyticstrackbatch) | **POST** /api/v1/projects/{projectId}/analytics/events/batch | Track multiple analytics events in batch|
|[**analyticsTrackEvent**](#analyticstrackevent) | **POST** /api/v1/projects/{projectId}/analytics/events | Track a single analytics event|

# **analyticsExport**
> analyticsExport()


### Example

```typescript
import {
    AnalyticsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AnalyticsApi(configuration);

let projectId: string; //Project ID (default to undefined)
let format: 'json' | 'csv'; //Export format (optional) (default to undefined)

const { status, data } = await apiInstance.analyticsExport(
    projectId,
    format
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **projectId** | [**string**] | Project ID | defaults to undefined|
| **format** | [**&#39;json&#39; | &#39;csv&#39;**]**Array<&#39;json&#39; &#124; &#39;csv&#39;>** | Export format | (optional) defaults to undefined|


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
|**200** | Data exported successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analyticsGetEngagementMetrics**
> analyticsGetEngagementMetrics()


### Example

```typescript
import {
    AnalyticsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AnalyticsApi(configuration);

let projectId: string; //Project ID (default to undefined)

const { status, data } = await apiInstance.analyticsGetEngagementMetrics(
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
|**200** | Engagement metrics retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analyticsGetEvents**
> analyticsGetEvents()


### Example

```typescript
import {
    AnalyticsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AnalyticsApi(configuration);

let projectId: string; //Project ID (default to undefined)

const { status, data } = await apiInstance.analyticsGetEvents(
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
|**200** | Events retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analyticsGetNotificationAnalytics**
> analyticsGetNotificationAnalytics()


### Example

```typescript
import {
    AnalyticsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AnalyticsApi(configuration);

let projectId: string; //Project ID (default to undefined)

const { status, data } = await apiInstance.analyticsGetNotificationAnalytics(
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
|**200** | Notification analytics retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analyticsGetNotificationFunnel**
> analyticsGetNotificationFunnel()


### Example

```typescript
import {
    AnalyticsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AnalyticsApi(configuration);

let projectId: string; //Project ID (default to undefined)

const { status, data } = await apiInstance.analyticsGetNotificationFunnel(
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
|**200** | Funnel data retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analyticsGetPerformanceMetrics**
> analyticsGetPerformanceMetrics()


### Example

```typescript
import {
    AnalyticsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AnalyticsApi(configuration);

let projectId: string; //Project ID (default to undefined)

const { status, data } = await apiInstance.analyticsGetPerformanceMetrics(
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
|**200** | Performance metrics retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analyticsGetRealTimeData**
> analyticsGetRealTimeData()


### Example

```typescript
import {
    AnalyticsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AnalyticsApi(configuration);

let projectId: string; //Project ID (default to undefined)

const { status, data } = await apiInstance.analyticsGetRealTimeData(
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
|**200** | Real-time data retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analyticsOverview**
> analyticsOverview()


### Example

```typescript
import {
    AnalyticsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AnalyticsApi(configuration);

let projectId: string; //Project ID (default to undefined)

const { status, data } = await apiInstance.analyticsOverview(
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
|**200** | Overview retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analyticsRealtimeSSE**
> analyticsRealtimeSSE()


### Example

```typescript
import {
    AnalyticsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AnalyticsApi(configuration);

let projectId: string; // (default to undefined)

const { status, data } = await apiInstance.analyticsRealtimeSSE(
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

# **analyticsTrackBatch**
> analyticsTrackBatch(body)


### Example

```typescript
import {
    AnalyticsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AnalyticsApi(configuration);

let projectId: string; //Project ID (default to undefined)
let body: any; //Batch payload

const { status, data } = await apiInstance.analyticsTrackBatch(
    projectId,
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **any**| Batch payload | |
| **projectId** | [**string**] | Project ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Batch events tracked successfully |  -  |
|**400** | Invalid payload |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analyticsTrackEvent**
> analyticsTrackEvent(body)


### Example

```typescript
import {
    AnalyticsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AnalyticsApi(configuration);

let projectId: string; //Project ID (default to undefined)
let body: any; //Event payload

const { status, data } = await apiInstance.analyticsTrackEvent(
    projectId,
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **any**| Event payload | |
| **projectId** | [**string**] | Project ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Event tracked successfully |  -  |
|**400** | Invalid payload |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

