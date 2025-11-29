# openapi_client.QueuesApi

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**queues_add_job**](QueuesApi.md#queues_add_job) | **POST** /api/v1/projects/{projectId}/queues/jobs | 
[**queues_cancel_job**](QueuesApi.md#queues_cancel_job) | **DELETE** /api/v1/projects/{projectId}/queues/jobs/{queueName}/{jobId} | 
[**queues_get_health_status**](QueuesApi.md#queues_get_health_status) | **GET** /api/v1/projects/{projectId}/queues/health | 
[**queues_get_job_status**](QueuesApi.md#queues_get_job_status) | **GET** /api/v1/projects/{projectId}/queues/jobs/{queueName}/{jobId}/status | 
[**queues_get_queue_stats**](QueuesApi.md#queues_get_queue_stats) | **GET** /api/v1/projects/{projectId}/queues/stats | 
[**queues_pause_queue**](QueuesApi.md#queues_pause_queue) | **POST** /api/v1/projects/{projectId}/queues/{queueName}/pause | 
[**queues_resume_queue**](QueuesApi.md#queues_resume_queue) | **POST** /api/v1/projects/{projectId}/queues/{queueName}/resume | 


# **queues_add_job**
> queues_add_job(project_id)

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
    api_instance = openapi_client.QueuesApi(api_client)
    project_id = 'project_id_example' # str | 

    try:
        api_instance.queues_add_job(project_id)
    except Exception as e:
        print("Exception when calling QueuesApi->queues_add_job: %s\n" % e)
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
**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **queues_cancel_job**
> queues_cancel_job(project_id, queue_name, job_id)

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
    api_instance = openapi_client.QueuesApi(api_client)
    project_id = 'project_id_example' # str | 
    queue_name = 'queue_name_example' # str | 
    job_id = 'job_id_example' # str | 

    try:
        api_instance.queues_cancel_job(project_id, queue_name, job_id)
    except Exception as e:
        print("Exception when calling QueuesApi->queues_cancel_job: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_id** | **str**|  | 
 **queue_name** | **str**|  | 
 **job_id** | **str**|  | 

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

# **queues_get_health_status**
> queues_get_health_status(project_id)

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
    api_instance = openapi_client.QueuesApi(api_client)
    project_id = 'project_id_example' # str | 

    try:
        api_instance.queues_get_health_status(project_id)
    except Exception as e:
        print("Exception when calling QueuesApi->queues_get_health_status: %s\n" % e)
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

# **queues_get_job_status**
> queues_get_job_status(project_id, queue_name, job_id)

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
    api_instance = openapi_client.QueuesApi(api_client)
    project_id = 'project_id_example' # str | 
    queue_name = 'queue_name_example' # str | 
    job_id = 'job_id_example' # str | 

    try:
        api_instance.queues_get_job_status(project_id, queue_name, job_id)
    except Exception as e:
        print("Exception when calling QueuesApi->queues_get_job_status: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_id** | **str**|  | 
 **queue_name** | **str**|  | 
 **job_id** | **str**|  | 

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

# **queues_get_queue_stats**
> queues_get_queue_stats(project_id, queue)

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
    api_instance = openapi_client.QueuesApi(api_client)
    project_id = 'project_id_example' # str | 
    queue = 'queue_example' # str | 

    try:
        api_instance.queues_get_queue_stats(project_id, queue)
    except Exception as e:
        print("Exception when calling QueuesApi->queues_get_queue_stats: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_id** | **str**|  | 
 **queue** | **str**|  | 

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

# **queues_pause_queue**
> queues_pause_queue(project_id, queue_name)

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
    api_instance = openapi_client.QueuesApi(api_client)
    project_id = 'project_id_example' # str | 
    queue_name = 'queue_name_example' # str | 

    try:
        api_instance.queues_pause_queue(project_id, queue_name)
    except Exception as e:
        print("Exception when calling QueuesApi->queues_pause_queue: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_id** | **str**|  | 
 **queue_name** | **str**|  | 

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

# **queues_resume_queue**
> queues_resume_queue(project_id, queue_name)

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
    api_instance = openapi_client.QueuesApi(api_client)
    project_id = 'project_id_example' # str | 
    queue_name = 'queue_name_example' # str | 

    try:
        api_instance.queues_resume_queue(project_id, queue_name)
    except Exception as e:
        print("Exception when calling QueuesApi->queues_resume_queue: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_id** | **str**|  | 
 **queue_name** | **str**|  | 

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

