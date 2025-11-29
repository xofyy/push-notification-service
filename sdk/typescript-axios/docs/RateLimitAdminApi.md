# RateLimitAdminApi

All URIs are relative to *http://localhost:3000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**rateLimitAdminGetCurrentProjectRateLimitStatus**](#ratelimitadmingetcurrentprojectratelimitstatus) | **GET** /api/v1/admin/rate-limits/status | Get current project rate limit status|
|[**rateLimitAdminGetProjectRateLimitStatus**](#ratelimitadmingetprojectratelimitstatus) | **GET** /api/v1/admin/rate-limits/status/{projectId} | Get rate limit status for a project|
|[**rateLimitAdminGetRateLimitHealth**](#ratelimitadmingetratelimithealth) | **GET** /api/v1/admin/rate-limits/health | Check rate limiting system health|
|[**rateLimitAdminResetCurrentProjectRateLimits**](#ratelimitadminresetcurrentprojectratelimits) | **DELETE** /api/v1/admin/rate-limits/reset | Reset rate limits for current project|
|[**rateLimitAdminResetProjectRateLimits**](#ratelimitadminresetprojectratelimits) | **DELETE** /api/v1/admin/rate-limits/reset/{projectId} | Reset rate limits for a project|

# **rateLimitAdminGetCurrentProjectRateLimitStatus**
> rateLimitAdminGetCurrentProjectRateLimitStatus()


### Example

```typescript
import {
    RateLimitAdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RateLimitAdminApi(configuration);

const { status, data } = await apiInstance.rateLimitAdminGetCurrentProjectRateLimitStatus();
```

### Parameters
This endpoint does not have any parameters.


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
|**200** | Rate limit status retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **rateLimitAdminGetProjectRateLimitStatus**
> rateLimitAdminGetProjectRateLimitStatus()


### Example

```typescript
import {
    RateLimitAdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RateLimitAdminApi(configuration);

let projectId: string; //Project ID to check (default to undefined)

const { status, data } = await apiInstance.rateLimitAdminGetProjectRateLimitStatus(
    projectId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **projectId** | [**string**] | Project ID to check | defaults to undefined|


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
|**200** | Rate limit status retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **rateLimitAdminGetRateLimitHealth**
> rateLimitAdminGetRateLimitHealth()


### Example

```typescript
import {
    RateLimitAdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RateLimitAdminApi(configuration);

const { status, data } = await apiInstance.rateLimitAdminGetRateLimitHealth();
```

### Parameters
This endpoint does not have any parameters.


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
|**200** | Rate limiting system health status |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **rateLimitAdminResetCurrentProjectRateLimits**
> rateLimitAdminResetCurrentProjectRateLimits()


### Example

```typescript
import {
    RateLimitAdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RateLimitAdminApi(configuration);

const { status, data } = await apiInstance.rateLimitAdminResetCurrentProjectRateLimits();
```

### Parameters
This endpoint does not have any parameters.


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
|**200** | Rate limits reset successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **rateLimitAdminResetProjectRateLimits**
> rateLimitAdminResetProjectRateLimits()


### Example

```typescript
import {
    RateLimitAdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RateLimitAdminApi(configuration);

let projectId: string; //Project ID to reset (default to undefined)

const { status, data } = await apiInstance.rateLimitAdminResetProjectRateLimits(
    projectId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **projectId** | [**string**] | Project ID to reset | defaults to undefined|


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
|**200** | Rate limits reset successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

