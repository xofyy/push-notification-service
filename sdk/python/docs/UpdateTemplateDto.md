# UpdateTemplateDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **str** | Template name | [optional] 
**description** | **str** | Template description | [optional] 
**title** | **str** | Notification title template | [optional] 
**body** | **str** | Notification body template | [optional] 
**image_url** | **str** | Image URL template | [optional] 
**data** | **object** | Custom data template | [optional] 
**variables** | **List[str]** | Template variables | [optional] 
**status** | **str** | Template status | [optional] 
**default_values** | **object** | Default variable values | [optional] 
**language** | **str** | Template language | [optional] 
**validation_rules** | **object** | Validation rules for variables | [optional] 
**version** | **float** | Template version | [optional] [default to 1]
**created_by** | **str** | Created by user ID | [optional] 
**updated_by** | **str** | Updated by user ID | [optional] 

## Example

```python
from openapi_client.models.update_template_dto import UpdateTemplateDto

# TODO update the JSON string below
json = "{}"
# create an instance of UpdateTemplateDto from a JSON string
update_template_dto_instance = UpdateTemplateDto.from_json(json)
# print the JSON string representation of the object
print(UpdateTemplateDto.to_json())

# convert the object into a dict
update_template_dto_dict = update_template_dto_instance.to_dict()
# create an instance of UpdateTemplateDto from a dict
update_template_dto_from_dict = UpdateTemplateDto.from_dict(update_template_dto_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


