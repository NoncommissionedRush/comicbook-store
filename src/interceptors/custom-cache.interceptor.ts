import { CacheInterceptor, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class CustomCacheInterceptor extends CacheInterceptor {
  excludePaths = ["/cart"];
  protected isRequestCacheable(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    return (
      this.allowedMethods.includes(req.method) &&
      !this.excludePaths.includes(req.url)
    );
  }
}
