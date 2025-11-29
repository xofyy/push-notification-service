# CreateTemplateDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** | Template name | [default to undefined]
**description** | **string** | Template description | [optional] [default to undefined]
**title** | **string** | Notification title template | [default to undefined]
**body** | **string** | Notification body template | [default to undefined]
**imageUrl** | **string** | Image URL template | [optional] [default to undefined]
**data** | **object** | Custom data template | [optional] [default to undefined]
**variables** | **Array&lt;string&gt;** | Template variables | [optional] [default to undefined]
**status** | **string** | Template status | [optional] [default to undefined]
**defaultValues** | **object** | Default variable values | [optional] [default to undefined]
**language** | **string** | Template language | [optional] [default to undefined]
**validationRules** | **object** | Validation rules for variables | [optional] [default to undefined]
**version** | **number** | Template version | [optional] [default to 1]
**createdBy** | **string** | Created by user ID | [optional] [default to undefined]

## Example

```typescript
import { CreateTemplateDto } from './api';

const instance: CreateTemplateDto = {
    name,
    description,
    title,
    body,
    imageUrl,
    data,
    variables,
    status,
    defaultValues,
    language,
    validationRules,
    version,
    createdBy,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
