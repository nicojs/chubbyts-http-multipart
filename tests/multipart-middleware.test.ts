import type { Stream } from 'stream';
import { PassThrough } from 'stream';
import { createReadStream, readFileSync, promises as fs } from 'fs';
import { tmpdir } from 'os';
import { createHash } from 'crypto';
import { describe, expect, test } from '@jest/globals';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import * as FormData from 'form-data';
import { parse } from 'qs';
import { createMultipartMiddleware } from '../src/multipart-middleware';

const redImagePath = process.cwd() + '/tests/resources/red.png';
const greenImagePath = process.cwd() + '/tests/resources/green.png';
const blueImagePath = process.cwd() + '/tests/resources/blue.png';

const sha1 = (input: string | Buffer) => createHash('sha1').update(input).digest('hex');

const createFormData = (): FormData => {
  const formData = new FormData();
  formData.append('id', '123e4567-e89b-12d3-a456-426655440000');
  formData.append('name', 'John Doe');
  formData.append(
    'address',
    JSON.stringify(
      {
        street: '3, Garden St',
        city: 'Hillsbery, UT',
      },
      null,
      2,
    ),
    { contentType: 'application/json' },
  );

  formData.append('red', createReadStream(redImagePath));
  formData.append('green', createReadStream(greenImagePath));
  formData.append('blue', createReadStream(blueImagePath));

  return formData;
};

const getStream = async (stream: Stream): Promise<string> => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line functional/no-let
    let data = '';

    stream.on('data', (chunk) => (data += chunk));
    stream.on('end', () => resolve(data));
    stream.on('error', (error) => reject(error));
  });
};

beforeEach(async () => {
  await fs.rm(`${tmpdir()}/multipart`, { force: true, recursive: true });
});

describe('createMultipartMiddleware', () => {
  test('without content-type', async () => {
    const request = { headers: {} } as unknown as ServerRequest;
    const response = {} as Response;

    const [handler, handlerMocks] = useFunctionMock<Handler>([
      {
        parameters: [request],
        return: Promise.resolve(response),
      },
    ]);

    const multipartMiddleware = createMultipartMiddleware();

    expect(await multipartMiddleware(request, handler)).toBe(response);

    expect(handlerMocks.length).toBe(0);
  });

  test('without multipart/form-data', async () => {
    const request = { headers: { 'content-type': ['application/x-www-form-urlencoded'] } } as unknown as ServerRequest;
    const response = {} as Response;

    const [handler, handlerMocks] = useFunctionMock<Handler>([
      {
        parameters: [request],
        return: Promise.resolve(response),
      },
    ]);

    const multipartMiddleware = createMultipartMiddleware();

    expect(await multipartMiddleware(request, handler)).toBe(response);

    expect(handlerMocks.length).toBe(0);
  });

  describe('with multipart/form-data', () => {
    test('successful', async () => {
      const requestBody = new PassThrough();

      const formData = createFormData();

      formData.pipe(requestBody);

      const request = {
        headers: { 'content-type': [`multipart/form-data; boundary=${formData.getBoundary()}`] },
        body: requestBody,
      } as unknown as ServerRequest;

      const response = {} as Response;

      const [handler, handlerMocks] = useFunctionMock<Handler>([
        {
          callback: async (givenRequest: ServerRequest) => {
            expect(givenRequest.headers['content-type'][0]).toBe('application/x-www-form-urlencoded');

            const data = parse(await getStream(givenRequest.body));

            expect(data).toEqual({
              id: '123e4567-e89b-12d3-a456-426655440000',
              name: 'John Doe',
              address: '{\n  "street": "3, Garden St",\n  "city": "Hillsbery, UT"\n}',
              red: expect.stringMatching(
                /^\/tmp\/multipart\/[0-9a-f]{128}\/red.png; filename=red.png; mimeType=image\/png$/,
              ),
              green: expect.stringMatching(
                /^\/tmp\/multipart\/[0-9a-f]{128}\/green.png; filename=green.png; mimeType=image\/png$/,
              ),
              blue: expect.stringMatching(
                /^\/tmp\/multipart\/[0-9a-f]{128}\/blue.png; filename=blue.png; mimeType=image\/png$/,
              ),
            });

            expect(
              sha1(
                readFileSync(
                  (data['red'] as string).match(/(\/tmp\/multipart\/[0-9a-f]{128}\/red.png)/)?.[0] as string,
                ),
              ),
            ).toBe(sha1(readFileSync(redImagePath)));

            expect(
              sha1(
                readFileSync(
                  (data['green'] as string).match(/(\/tmp\/multipart\/[0-9a-f]{128}\/green.png)/)?.[0] as string,
                ),
              ),
            ).toBe(sha1(readFileSync(greenImagePath)));

            expect(
              sha1(
                readFileSync(
                  (data['blue'] as string).match(/(\/tmp\/multipart\/[0-9a-f]{128}\/blue.png)/)?.[0] as string,
                ),
              ),
            ).toBe(sha1(readFileSync(blueImagePath)));

            return response;
          },
        },
      ]);

      const multipartMiddleware = createMultipartMiddleware();

      expect(await multipartMiddleware(request, handler)).toBe(response);

      expect(handlerMocks.length).toBe(0);
    });

    test('allow only 1 file', async () => {
      const requestBody = new PassThrough();

      const formData = createFormData();

      formData.pipe(requestBody);

      const request = {
        headers: { 'content-type': [`multipart/form-data; boundary=${formData.getBoundary()}`] },
        body: requestBody,
      } as unknown as ServerRequest;

      const response = {} as Response;

      const [handler, handlerMocks] = useFunctionMock<Handler>([
        {
          callback: async (givenRequest: ServerRequest) => {
            expect(givenRequest.headers['content-type'][0]).toBe('application/x-www-form-urlencoded');

            const data = parse(await getStream(givenRequest.body));

            expect(data).toEqual({
              id: '123e4567-e89b-12d3-a456-426655440000',
              name: 'John Doe',
              address: '{\n  "street": "3, Garden St",\n  "city": "Hillsbery, UT"\n}',
              red: expect.stringMatching(
                /^\/tmp\/multipart\/[0-9a-f]{128}\/red.png; filename=red.png; mimeType=image\/png$/,
              ),
            });

            expect(
              sha1(
                readFileSync(
                  (data['red'] as string).match(/(\/tmp\/multipart\/[0-9a-f]{128}\/red.png)/)?.[0] as string,
                ),
              ),
            ).toBe(sha1(readFileSync(redImagePath)));

            return response;
          },
        },
      ]);

      const multipartMiddleware = createMultipartMiddleware({ files: 1 });

      expect(await multipartMiddleware(request, handler)).toBe(response);

      expect(handlerMocks.length).toBe(0);
    });
  });
});
