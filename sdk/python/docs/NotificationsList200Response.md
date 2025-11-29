# NotificationsList200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**items** | **List[object]** |  | [optional] 
**total** | **float** |  | [optional] 
**limit** | **float** |  | [optional] 
**offset** | **float** |  | [optional] 

## Example

```python
from openapi_client.models.notifications_list200_response import NotificationsList200Response

# TODO update the JSON string below
json = "{}"
# create an instance of NotificationsList200Response from a JSON string
notifications_list200_response_instance = NotificationsList200Response.from_json(json)
# print the JSON string representation of the object
print(NotificationsList200Response.to_json())

# convert the object into a dict
notifications_list200_response_dict = notifications_list200_response_instance.to_dict()
# create an instance of NotificationsList200Response from a dict
notifications_list200_response_from_dict = NotificationsList200Response.from_dict(notifications_list200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


