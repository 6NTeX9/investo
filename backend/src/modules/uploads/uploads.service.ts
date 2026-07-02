import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UTApi } from "uploadthing/server";

@Injectable()
export class UploadsService {
  private readonly utapi: UTApi;

  constructor(private readonly config: ConfigService) {
    this.utapi = new UTApi();
  }

  async remove(key: string) {
    await this.utapi.deleteFiles(key);
    return { deleted: true };
  }
}
