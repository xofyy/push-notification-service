# openapi_client.AnalyticsApi

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**analytics_export**](AnalyticsApi.md#analytics_export) | **GET** /api/v1/projects/{projectId}/analytics/export | Export analytics data
[**analytics_get_engagement_metrics**](AnalyticsApi.md#analytics_get_engagement_metrics) | **GET** /api/v1/projects/{projectId}/analytics/engagement | Get user engagement metrics
[**analytics_get_events**](AnalyticsApi.md#analytics_get_events) | **GET** /api/v1/projects/{projectId}/analytics/events | Get analytics events with filtering and pagination
[**analytics_get_notification_analytics**](AnalyticsApi.md#analytics_get_notification_analytics) | **GET** /api/v1/projects/{projectId}/analytics/notifications | Get notification analytics and performance metrics
[**analytics_get_notification_funnel**](AnalyticsApi.md#analytics_get_notification_funnel) | **GET** /api/v1/projects/{projectId}/analytics/notifications/funnel | Get notification conversion funnel
[**analytics_get_performance_metrics**](AnalyticsApi.md#analytics_get_performance_metrics) | **GET** /api/v1/projects/{projectId}/analytics/performance | Get system performance metrics
[**analytics_get_real_time_data**](AnalyticsApi.md#analytics_get_real_time_data) | **GET** /api/v1/projects/{projectId}/analytics/realtime | Get real-time analytics dashboard data
[**analytics_overview**](AnalyticsApi.md#analytics_overview) | **GET** /api/v1/projects/{projectId}/analytics/overview | Get project analytics overview
[**analytics_realtime_sse**](AnalyticsApi.md#analytics_realtime_sse) | **GET** /api/v1/projects/{projectId}/analytics/realtime-sse | Server-Sent Events for real-time analytics (last hour, updates every 30s)
[**analytics_track_batch**](AnalyticsApi.md#analytics_track_batch) | **POST** /api/v1/projects/{projectId}/analytics/events/batch | Track multiple analytics events in batch
[**analytics_track_event**](AnalyticsApi.md#analytics_track_event) | **POST** /api/v1/projects/{projectId}/analytics/events | Track a single analytics event


# **analytics_export**
> analytics_export(project_id, format=format)

Export analytics data

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
    api_instance = openapi_client.AnalyticsApi(api_client)
    project_id = 'project_id_example' # str | Project ID
    format = 'format_example' # str | Export format (optional)

    try:
        # Export analytics data
        api_instance.analytics_export(project_id, format=format)
    except Exception as e:
        print("Exception when calling AnalyticsApi->analytics_export: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_id** | **str**| Project ID | 
 **format** | **str**| Export format | [optional] 

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
**200** | Data exported successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analytics_get_engagement_metrics**
> analytics_get_engagement_metrics(project_id)

Get user engagement metrics

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
    api_instance = openapi_client.AnalyticsApi(api_client)
    project_id = 'project_id_example' # str | Project ID

    try:
        # Get user engagement metrics
        api_instance.analytics_get_engagement_metrics(project_id)
    except Exception as e:
        print("Exception when calling AnalyticsApi->analytics_get_engagement_metrics: %s\n" % e)
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
**200** | Engagement metrics retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analytics_get_events**
> analytics_get_events(project_id)

Get analytics events with filtering and pagination

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
    api_instance = openapi_client.AnalyticsApi(api_client)
    project_id = 'project_id_example' # str | Project ID

    try:
        # Get analytics events with filtering and pagination
        api_instance.analytics_get_events(project_id)
    except Exception as e:
        print("Exception when calling AnalyticsApi->analytics_get_events: %s\n" % e)
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
**200** | Events retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analytics_get_notification_analytics**
> analytics_get_notification_analytics(project_id)

Get notification analytics and performance metrics

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
    api_instance = openapi_client.AnalyticsApi(api_client)
    project_id = 'project_id_example' # str | Project ID

    try:
        # Get notification analytics and performance metrics
        api_instance.analytics_get_notification_analytics(project_id)
    except Exception as e:
        print("Exception when calling AnalyticsApi->analytics_get_notification_analytics: %s\n" % e)
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
**200** | Notification analytics retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analytics_get_notification_funnel**
> analytics_get_notification_funnel(project_id)

Get notification conversion funnel

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
    api_instance = openapi_client.AnalyticsApi(api_client)
    project_id = 'project_id_example' # str | Project ID

    try:
        # Get notification conversion funnel
        api_instance.analytics_get_notification_funnel(project_id)
    except Exception as e:
        print("Exception when calling AnalyticsApi->analytics_get_notification_funnel: %s\n" % e)
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
**200** | Funnel data retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analytics_get_performance_metrics**
> analytics_get_performance_metrics(project_id)

Get system performance metrics

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
    api_instance = openapi_client.AnalyticsApi(api_client)
    project_id = 'project_id_example' # str | Project ID

    try:
        # Get system performance metrics
        api_instance.analytics_get_performance_metrics(project_id)
    except Exception as e:
        print("Exception when calling AnalyticsApi->analytics_get_performance_metrics: %s\n" % e)
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
**200** | Performance metrics retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analytics_get_real_time_data**
> analytics_get_real_time_data(project_id)

Get real-time analytics dashboard data

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
    api_instance = openapi_client.AnalyticsApi(api_client)
    project_id = 'project_id_example' # str | Project ID

    try:
        # Get real-time analytics dashboard data
        api_instance.analytics_get_real_time_data(project_id)
    except Exception as e:
        print("Exception when calling AnalyticsApi->analytics_get_real_time_data: %s\n" % e)
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
**200** | Real-time data retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analytics_overview**
> analytics_overview(project_id)

Get project analytics overview

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
    api_instance = openapi_client.AnalyticsApi(api_client)
    project_id = 'project_id_example' # str | Project ID

    try:
        # Get project analytics overview
        api_instance.analytics_overview(project_id)
    except Exception as e:
        print("Exception when calling AnalyticsApi->analytics_overview: %s\n" % e)
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
**200** | Overview retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analytics_realtime_sse**
> analytics_realtime_sse(project_id)

Server-Sent Events for real-time analytics (last hour, updates every 30s)

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
    api_instance = openapi_client.AnalyticsApi(api_client)
    project_id = 'project_id_example' # str | 

    try:
        # Server-Sent Events for real-time analytics (last hour, updates every 30s)
        api_instance.analytics_realtime_sse(project_id)
    except Exception as e:
        print("Exception when calling AnalyticsApi->analytics_realtime_sse: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_id** | **str**|  | 

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
**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analytics_track_batch**
> analytics_track_batch(project_id, body)

Track multiple analytics events in batch

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
    api_instance = openapi_client.AnalyticsApi(api_client)
    project_id = 'project_id_example' # str | Project ID
    body = None # object | Batch payload

    try:
        # Track multiple analytics events in batch
        api_instance.analytics_track_batch(project_id, body)
    except Exception as e:
        print("Exception when calling AnalyticsApi->analytics_track_batch: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_id** | **str**| Project ID | 
 **body** | **object**| Batch payload | 

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
**201** | Batch events tracked successfully |  -  |
**400** | Invalid payload |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analytics_track_event**
> analytics_track_event(project_id, body)

Track a single analytics event

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
    api_instance = openapi_client.AnalyticsApi(api_client)
    project_id = 'project_id_example' # str | Project ID
    body = None # object | Event payload

    try:
        # Track a single analytics event
        api_instance.analytics_track_event(project_id, body)
    except Exception as e:
        print("Exception when calling AnalyticsApi->analytics_track_event: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_id** | **str**| Project ID | 
 **body** | **object**| Event payload | 

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
**201** | Event tracked successfully |  -  |
**400** | Invalid payload |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

