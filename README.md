# 0xSquid SDK

[![Unit Tests](https://github.com/0xsquid/squid-sdk/workflows/Unit%20Tests/badge.svg)](https://github.com/0xsquid/squid-sdk/actions?query=workflow%3A%22Unit+Tests%22)
[![Lint](https://github.com/0xsquid/squid-sdk//workflows/Lint/badge.svg)](https://github.com/0xsquid/squid-sdk/actions?query=workflow%3ALint)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![npm version](https://img.shields.io/npm/v/@0xsquid/sdk/latest.svg)](https://www.npmjs.com/package/@0xsquid/sdk/v/latest)
[![npm bundle size (scoped version)](https://img.shields.io/bundlephobia/minzip/@0xsquid/sdk/latest.svg)](https://bundlephobia.com/result?p=@0xsquid/sdk@latest)

In-depth documentation on Squid SDK is available at [Squidrouter docs](https://docs.squidrouter.com/sdk/installing-our-sdk)

## Development notes

### Dependency pins

**`resolutions["@wallet-standard/errors"]: 0.1.1`** — `@mysten/wallet-standard` pulls
`@wallet-standard/core`, whose `^0.1.1` range floats to `0.1.2`, and `0.1.2` raised its engine floor
to `node >=22`. Yarn 1 enforces `engines` as a hard install failure, so without this pin `yarn install`
fails on Node 20. Remove it once this package no longer needs to install on Node 20.
Note the pin only fixes our own installs — `resolutions` is Yarn-specific and ignored by consumers,
so a consumer on Node 20 with Yarn 1 still hits the engine error.

**`@mysten/sui` and `@mysten/wallet-standard` are exact-pinned and must be bumped together.**
`@mysten/wallet-standard` exact-pins `@mysten/sui`, so if the two disagree the tree ends up with two
physical `@mysten/sui` copies. That matters beyond bundle size: the copies can resolve different
`valibot` majors, which is what caused [the ReDoS advisory to be unfixable by a consumer-side
override](https://github.com/0xsquid/squid-sdk/pull/414). Check `@mysten/wallet-standard`'s pinned
`@mysten/sui` version before changing either.
