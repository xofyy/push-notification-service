import { IsString, IsArray, IsUrl, ArrayMinSize } from 'class-validator';

export class WebhookDto {
    @IsUrl()
    url!: string;

    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    events!: string[];
}
