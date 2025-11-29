import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
    data: T;
    meta?: any;
}

@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, Response<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<Response<T>> {
        return next.handle().pipe(
            map((data) => {
                // If data already has data property (e.g. paginated result), return as is
                if (data && data.data) {
                    return data;
                }
                // If data is paginated result with items/total
                if (data && Array.isArray(data.items) && typeof data.total === 'number') {
                    return {
                        data: data.items,
                        meta: {
                            total: data.total,
                            limit: data.limit,
                            offset: data.offset,
                        },
                    };
                }
                return { data };
            }),
        );
    }
}
