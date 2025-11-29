# ValidateTemplateDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** | Template title to validate | [default to undefined]
**body** | **string** | Template body to validate | [default to undefined]
**imageUrl** | **string** | Template image URL to validate | [optional] [default to undefined]
**data** | **object** | Template data to validate | [optional] [default to undefined]
**testVariables** | **object** | Test variables for validation | [default to undefined]

## Example

```typescript
import { ValidateTemplateDto } from './api';

const instance: ValidateTemplateDto = {
    title,
    body,
    imageUrl,
    data,
    testVariables,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
