# CreateTemplateDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **str** | Template name | 
**description** | **str** | Template description | [optional] 
**title** | **str** | Notification title template | 
**body** | **str** | Notification body template | 
**image_url** | **str** | Image URL template | [optional] 
**data** | **object** | Custom data template | [optional] 
**variables** | **List[str]** | Template variables | [optional] 
**status** | **str** | Template status | [optional] 
**default_values** | **object** | Default variable values | [optional] 
**language** | **str** | Template language | [optional] 
**validation_rules** | **object** | Validation rules for variables | [optional] 
**version** | **float** | Template version | [optional] [default to 1]
**created_by** | **str** | Created by user ID | [optional] 

## Example

```python
from openapi_client.models.create_template_dto import CreateTemplateDto

# TODO update the JSON string below
json = "{}"
# create an instance of CreateTemplateDto from a JSON string
create_template_dto_instance = CreateTemplateDto.from_json(json)
# print the JSON string representation of the object
print(CreateTemplateDto.to_json())

# convert the object into a dict
create_template_dto_dict = create_template_dto_instance.to_dict()
# create an instance of CreateTemplateDto from a dict
create_template_dto_from_dict = CreateTemplateDto.from_dict(create_template_dto_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


