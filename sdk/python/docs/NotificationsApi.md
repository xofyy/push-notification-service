# openapi_client.NotificationsApi

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**notifications_cancel**](NotificationsApi.md#notifications_cancel) | **PATCH** /api/v1/projects/{projectId}/notifications/{id}/cancel | Cancel a scheduled/recurring notification
[**notifications_get_by_id**](NotificationsApi.md#notifications_get_by_id) | **GET** /api/v1/projects/{projectId}/notifications/{id} | Get notification by id
[**notifications_get_stats**](NotificationsApi.md#notifications_get_stats) | **GET** /api/v1/projects/{projectId}/notifications/stats | 
[**notifications_list**](NotificationsApi.md#notifications_list) | **GET** /api/v1/projects/{projectId}/notifications | List notifications
[**notifications_send**](NotificationsApi.md#notifications_send) | **POST** /api/v1/projects/{projectId}/notifications/send | Send push notification


# **notifications_cancel**
> notifications_cancel(x_api_key, project_id, id)

Cancel a scheduled/recurring notification

### Example

* Api Key Authentication (ApiKeyAuth):

```python
import openapi_client
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost:3000"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: ApiKeyAuth
configuration.api_key['ApiKeyAuth'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['ApiKeyAuth'] = 'Bearer'

# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.NotificationsApi(api_client)
    x_api_key = 'x_api_key_example' # str | API Key for authentication
    project_id = 'project_id_example' # str | 
    id = 'id_example' # str | 

    try:
        # Cancel a scheduled/recurring notification
        api_instance.notifications_cancel(x_api_key, project_id, id)
    except Exception as e:
        print("Exception when calling NotificationsApi->notifications_cancel: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **x_api_key** | **str**| API Key for authentication | 
 **project_id** | **str**|  | 
 **id** | **str**|  | 

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
**404** | Notification not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **notifications_get_by_id**
> notifications_get_by_id(x_api_key, project_id, id)

Get notification by id

### Example

* Api Key Authentication (ApiKeyAuth):

```python
import openapi_client
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost:3000"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: ApiKeyAuth
configuration.api_key['ApiKeyAuth'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['ApiKeyAuth'] = 'Bearer'

# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.NotificationsApi(api_client)
    x_api_key = 'x_api_key_example' # str | API Key for authentication
    project_id = 'project_id_example' # str | 
    id = 'id_example' # str | 

    try:
        # Get notification by id
        api_instance.notifications_get_by_id(x_api_key, project_id, id)
    except Exception as e:
        print("Exception when calling NotificationsApi->notifications_get_by_id: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **x_api_key** | **str**| API Key for authentication | 
 **project_id** | **str**|  | 
 **id** | **str**|  | 

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
**404** | Notification not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **notifications_get_stats**
> notifications_get_stats(x_api_key, project_id, days)

### Example

* Api Key Authentication (ApiKeyAuth):

```python
import openapi_client
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost:3000"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: ApiKeyAuth
configuration.api_key['ApiKeyAuth'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['ApiKeyAuth'] = 'Bearer'

# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.NotificationsApi(api_client)
    x_api_key = 'x_api_key_example' # str | API Key for authentication
    project_id = 'project_id_example' # str | 
    days = 'days_example' # str | 

    try:
        api_instance.notifications_get_stats(x_api_key, project_id, days)
    except Exception as e:
        print("Exception when calling NotificationsApi->notifications_get_stats: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **x_api_key** | **str**| API Key for authentication | 
 **project_id** | **str**|  | 
 **days** | **str**|  | 

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
**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **notifications_list**
> NotificationsList200Response notifications_list(x_api_key, project_id, status=status, type=type, limit=limit, offset=offset, sort_by=sort_by, sort_order=sort_order)

List notifications

Retrieves a paginated list of notifications with optional filtering by status and type.

### Example

* Api Key Authentication (ApiKeyAuth):

```python
import openapi_client
from openapi_client.models.notifications_list200_response import NotificationsList200Response
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost:3000"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: ApiKeyAuth
configuration.api_key['ApiKeyAuth'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['ApiKeyAuth'] = 'Bearer'

# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.NotificationsApi(api_client)
    x_api_key = 'x_api_key_example' # str | API Key for authentication
    project_id = '64f1a2b3c4d5e6f7a8b9c0d1' # str | Project ID
    status = 'status_example' # str | Filter by notification status (optional)
    type = 'type_example' # str | Filter by notification type (optional)
    limit = 20 # float | Number of notifications to return (max 100) (optional)
    offset = 0 # float | Number of notifications to skip (offset) (optional)
    sort_by = 'createdAt' # str |  (optional)
    sort_order = 'sort_order_example' # str |  (optional)

    try:
        # List notifications
        api_response = api_instance.notifications_list(x_api_key, project_id, status=status, type=type, limit=limit, offset=offset, sort_by=sort_by, sort_order=sort_order)
        print("The response of NotificationsApi->notifications_list:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling NotificationsApi->notifications_list: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **x_api_key** | **str**| API Key for authentication | 
 **project_id** | **str**| Project ID | 
 **status** | **str**| Filter by notification status | [optional] 
 **type** | **str**| Filter by notification type | [optional] 
 **limit** | **float**| Number of notifications to return (max 100) | [optional] 
 **offset** | **float**| Number of notifications to skip (offset) | [optional] 
 **sort_by** | **str**|  | [optional] 
 **sort_order** | **str**|  | [optional] 

### Return type

[**NotificationsList200Response**](NotificationsList200Response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **notifications_send**
> object notifications_send(x_api_key, project_id, idempotency_key, body)

Send push notification


      Sends a push notification to specified devices or user segments.
      Supports multi-platform delivery (iOS, Android, Web) with platform-specific customization.
      Rate limited to 100 requests per minute.
    

### Example

* Api Key Authentication (ApiKeyAuth):

```python
import openapi_client
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost:3000"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: ApiKeyAuth
configuration.api_key['ApiKeyAuth'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['ApiKeyAuth'] = 'Bearer'

# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.NotificationsApi(api_client)
    x_api_key = 'x_api_key_example' # str | API Key for authentication
    project_id = '64f1a2b3c4d5e6f7a8b9c0d1' # str | Project ID
    idempotency_key = 'idempotency_key_example' # str | 
    body = {"title":"Hello from API","body":"Quick flow test","type":"instant","targetDevices":["64f1a2b3c4d5e6f7a8b9c0ff"]} # str | Send payload (examples for instant and scheduled)

    try:
        # Send push notification
        api_response = api_instance.notifications_send(x_api_key, project_id, idempotency_key, body)
        print("The response of NotificationsApi->notifications_send:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling NotificationsApi->notifications_send: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **x_api_key** | **str**| API Key for authentication | 
 **project_id** | **str**| Project ID | 
 **idempotency_key** | **str**|  | 
 **body** | **str**| Send payload (examples for instant and scheduled) | 

### Return type

**object**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** | Notification sent successfully |  -  |
**400** | Invalid notification data |  -  |
**429** | Rate limit exceeded |  * X-RateLimit-Limit - Request limit <br>  * X-RateLimit-Remaining - Remaining requests <br>  * X-RateLimit-Reset - Reset time <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

