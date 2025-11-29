# RenderTemplateDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**template** | **str** | Template ID or name to render | 
**variables** | **object** | Variables to substitute in template | 
**preview** | **bool** | Preview mode - do not save statistics | [optional] 

## Example

```python
from openapi_client.models.render_template_dto import RenderTemplateDto

# TODO update the JSON string below
json = "{}"
# create an instance of RenderTemplateDto from a JSON string
render_template_dto_instance = RenderTemplateDto.from_json(json)
# print the JSON string representation of the object
print(RenderTemplateDto.to_json())

# convert the object into a dict
render_template_dto_dict = render_template_dto_instance.to_dict()
# create an instance of RenderTemplateDto from a dict
render_template_dto_from_dict = RenderTemplateDto.from_dict(render_template_dto_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


