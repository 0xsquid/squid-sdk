# api-sdk

## Examples to interact with the Squid API - testnet supported

API endpoint documentation
https://app.gitbook.com/o/bX90yMGYDBu3T1Hqg4EA/s/tXbXyuWIO2PwzNc5Dets/integrate-squid/api

- install package dependancies "yarn install"
- configuration in .env file (rename example to .env)
- explore the /api/quotes & api/tokens endpoints for supported chains and tokens
- run approval.ts to approve tokens before any transactions eg "yarn ts-node approve.ts"
- run transaction.ts to query /api/transaction endpoint and send tokens cross chain ✨

## Notes

Transactions are not sent via the api, the api is a helper endpoint only, transactions are submitted via the callers rpc endpoint.
