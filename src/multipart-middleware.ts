import { randomBytes } from 'crypto';
import { createWriteStream, mkdirSync } from 'fs';
import type { IncomingHttpHeaders } from 'http';
import { tmpdir } from 'os';
import { PassThrough } from 'stream';
import * as busboy from 'busboy';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import type { ServerRequest, Response } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';

export const createMultipartMiddleware = (): Middleware => {
  return async (request: ServerRequest, handler: Handler): Promise<Response> => {
    const headers: IncomingHttpHeaders = Object.fromEntries(
      Object.entries(request.headers).map(([name, value]) => [name, value.join()]),
    );

    if (!headers['content-type']?.match(/multipart\/form-data/)) {
      return handler(request);
    }

    const body = await new Promise<PassThrough>((resolve) => {
      const temporaryPath = `${tmpdir()}/multipart/${randomBytes(64).toString('hex')}`;

      mkdirSync(temporaryPath, { recursive: true });

      const newBody = new PassThrough();

      const multipartStream = busboy({ headers });

      multipartStream.on('file', (name, file, info) => {
        const { filename, mimeType } = info;
        const filePath = `${temporaryPath}/${filename}`;

        file.pipe(createWriteStream(filePath));

        const value = `${filePath}; filename=${filename}; mimeType=${mimeType}`;

        newBody.write(`${name}=${encodeURIComponent(value)}&`);
      });

      multipartStream.on('field', (name, value) => {
        newBody.write(`${name}=${encodeURIComponent(value)}&`);
      });

      multipartStream.on('close', () => {
        newBody.end();
        resolve(newBody);
      });

      request.body.pipe(multipartStream);
    });

    return handler({
      ...request,
      headers: { ...request.headers, 'content-type': ['application/x-www-form-urlencoded'] },
      body,
    });
  };
};
