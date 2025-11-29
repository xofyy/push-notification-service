# RenderTemplateDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**template** | **string** | Template ID or name to render | [default to undefined]
**variables** | **object** | Variables to substitute in template | [default to undefined]
**preview** | **boolean** | Preview mode - do not save statistics | [optional] [default to undefined]

## Example

```typescript
import { RenderTemplateDto } from './api';

const instance: RenderTemplateDto = {
    template,
    variables,
    preview,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
