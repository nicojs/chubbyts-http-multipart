# chubbyts-http-multipart

[![CI](https://github.com/chubbyts/chubbyts-http-multipart/actions/workflows/ci.yml/badge.svg)](https://github.com/chubbyts/chubbyts-http-multipart/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/chubbyts/chubbyts-http-multipart/badge.svg?branch=master)](https://coveralls.io/github/chubbyts/chubbyts-http-multipart?branch=master)
[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fchubbyts%2Fchubbyts-http-multipart%2Fmaster)](https://dashboard.stryker-mutator.io/reports/github.com/chubbyts/chubbyts-http-multipart/master)
[![npm-version](https://img.shields.io/npm/v/@chubbyts/chubbyts-http-multipart.svg)](https://www.npmjs.com/package/@chubbyts/chubbyts-http-multipart)

[![bugs](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-multipart&metric=bugs)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-multipart)
[![code_smells](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-multipart&metric=code_smells)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-multipart)
[![coverage](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-multipart&metric=coverage)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-multipart)
[![duplicated_lines_density](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-multipart&metric=duplicated_lines_density)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-multipart)
[![ncloc](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-multipart&metric=ncloc)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-multipart)
[![sqale_rating](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-multipart&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-multipart)
[![alert_status](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-multipart&metric=alert_status)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-multipart)
[![reliability_rating](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-multipart&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-multipart)
[![security_rating](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-multipart&metric=security_rating)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-multipart)
[![sqale_index](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-multipart&metric=sqale_index)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-multipart)
[![vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-multipart&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-multipart)

## Description

Chubbyts Http multipart request handling.

## Requirements

 * node: 16
 * [@chubbyts/chubbyts-http-types][2]: ^1.2.3
 * [busboy][3]: ^1.6.0

## Installation

Through [NPM](https://www.npmjs.com) as [@chubbyts/chubbyts-http-multipart][1].

```sh
npm i @chubbyts/chubbyts-http-multipart@^1.1.0
```

## Usage

```ts
import { createMultipartMiddleware } from '@chubbyts/chubbyts-http-multipart/dist/multipart-middleware';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';

const request: ServerRequest = ...;
const response: Response = ...;

// if request original content-type was multipart/form-data, the current content-type and body is now application/x-www-form-urlencoded
const handler: Handler = async (request: ServerRequest): Promise<Response> ...;

const multipartMiddleware = createMultipartMiddleware();

const response = await multipartMiddleware(request, handler);
```

### Example

#### Input

```
----------------------------394107496171408467161617
Content-Disposition: form-data; name="id"

123e4567-e89b-12d3-a456-426655440000
----------------------------394107496171408467161617
Content-Disposition: form-data; name="name"

John Doe
----------------------------394107496171408467161617
Content-Disposition: form-data; name="address"
Content-Type: application/json

{
  "street": "3, Garden St",
  "city": "Hillsbery, UT"
}
----------------------------394107496171408467161617
Content-Disposition: form-data; name="red"; filename="red.png"
Content-Type: image/png

<binary>
----------------------------394107496171408467161617
Content-Disposition: form-data; name="green"; filename="green.png"
Content-Type: image/png

<binary>
----------------------------394107496171408467161617
Content-Disposition: form-data; name="blue"; filename="blue.png"
Content-Type: image/png

<binary>
----------------------------394107496171408467161617--
```

#### Output

*Optimized for human readability*

```
id=123e4567-e89b-12d3-a456-426655440000&
name=John Doe&
address={\n  "street": "3, Garden St",\n  "city": "Hillsbery, UT"\n}&
red=/tmp/multipart/.../red.png; filename=red.png; mimeType=image/png&
green=/tmp/multipart/.../green.png; filename=green.png; mimeType=image/png&
blue=/tmp/multipart/.../blue.png; filename=blue.png; mimeType=image/png&
```


## Copyright

2024 Dominik Zogg

[1]: https://www.npmjs.com/package/@chubbyts/chubbyts-http-multipart
[2]: https://www.npmjs.com/package/@chubbyts/chubbyts-http-types
[3]: https://www.npmjs.com/package/busboy
