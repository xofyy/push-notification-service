# ValidateTemplateDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **str** | Template title to validate | 
**body** | **str** | Template body to validate | 
**image_url** | **str** | Template image URL to validate | [optional] 
**data** | **object** | Template data to validate | [optional] 
**test_variables** | **object** | Test variables for validation | 

## Example

```python
from openapi_client.models.validate_template_dto import ValidateTemplateDto

# TODO update the JSON string below
json = "{}"
# create an instance of ValidateTemplateDto from a JSON string
validate_template_dto_instance = ValidateTemplateDto.from_json(json)
# print the JSON string representation of the object
print(ValidateTemplateDto.to_json())

# convert the object into a dict
validate_template_dto_dict = validate_template_dto_instance.to_dict()
# create an instance of ValidateTemplateDto from a dict
validate_template_dto_from_dict = ValidateTemplateDto.from_dict(validate_template_dto_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


