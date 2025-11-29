# openapi_client.RateLimitAdminApi

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**rate_limit_admin_get_current_project_rate_limit_status**](RateLimitAdminApi.md#rate_limit_admin_get_current_project_rate_limit_status) | **GET** /api/v1/admin/rate-limits/status | Get current project rate limit status
[**rate_limit_admin_get_project_rate_limit_status**](RateLimitAdminApi.md#rate_limit_admin_get_project_rate_limit_status) | **GET** /api/v1/admin/rate-limits/status/{projectId} | Get rate limit status for a project
[**rate_limit_admin_get_rate_limit_health**](RateLimitAdminApi.md#rate_limit_admin_get_rate_limit_health) | **GET** /api/v1/admin/rate-limits/health | Check rate limiting system health
[**rate_limit_admin_reset_current_project_rate_limits**](RateLimitAdminApi.md#rate_limit_admin_reset_current_project_rate_limits) | **DELETE** /api/v1/admin/rate-limits/reset | Reset rate limits for current project
[**rate_limit_admin_reset_project_rate_limits**](RateLimitAdminApi.md#rate_limit_admin_reset_project_rate_limits) | **DELETE** /api/v1/admin/rate-limits/reset/{projectId} | Reset rate limits for a project


# **rate_limit_admin_get_current_project_rate_limit_status**
> rate_limit_admin_get_current_project_rate_limit_status()

Get current project rate limit status

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
    api_instance = openapi_client.RateLimitAdminApi(api_client)

    try:
        # Get current project rate limit status
        api_instance.rate_limit_admin_get_current_project_rate_limit_status()
    except Exception as e:
        print("Exception when calling RateLimitAdminApi->rate_limit_admin_get_current_project_rate_limit_status: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

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
**200** | Rate limit status retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **rate_limit_admin_get_project_rate_limit_status**
> rate_limit_admin_get_project_rate_limit_status(project_id)

Get rate limit status for a project

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
    api_instance = openapi_client.RateLimitAdminApi(api_client)
    project_id = 'project_id_example' # str | Project ID to check

    try:
        # Get rate limit status for a project
        api_instance.rate_limit_admin_get_project_rate_limit_status(project_id)
    except Exception as e:
        print("Exception when calling RateLimitAdminApi->rate_limit_admin_get_project_rate_limit_status: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_id** | **str**| Project ID to check | 

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
**200** | Rate limit status retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **rate_limit_admin_get_rate_limit_health**
> rate_limit_admin_get_rate_limit_health()

Check rate limiting system health

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
    api_instance = openapi_client.RateLimitAdminApi(api_client)

    try:
        # Check rate limiting system health
        api_instance.rate_limit_admin_get_rate_limit_health()
    except Exception as e:
        print("Exception when calling RateLimitAdminApi->rate_limit_admin_get_rate_limit_health: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

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
**200** | Rate limiting system health status |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **rate_limit_admin_reset_current_project_rate_limits**
> rate_limit_admin_reset_current_project_rate_limits()

Reset rate limits for current project

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
    api_instance = openapi_client.RateLimitAdminApi(api_client)

    try:
        # Reset rate limits for current project
        api_instance.rate_limit_admin_reset_current_project_rate_limits()
    except Exception as e:
        print("Exception when calling RateLimitAdminApi->rate_limit_admin_reset_current_project_rate_limits: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

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
**200** | Rate limits reset successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **rate_limit_admin_reset_project_rate_limits**
> rate_limit_admin_reset_project_rate_limits(project_id)

Reset rate limits for a project

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
    api_instance = openapi_client.RateLimitAdminApi(api_client)
    project_id = 'project_id_example' # str | Project ID to reset

    try:
        # Reset rate limits for a project
        api_instance.rate_limit_admin_reset_project_rate_limits(project_id)
    except Exception as e:
        print("Exception when calling RateLimitAdminApi->rate_limit_admin_reset_project_rate_limits: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_id** | **str**| Project ID to reset | 

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
**200** | Rate limits reset successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

