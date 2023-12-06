export type CosmosMsg = {
  typeUrl: string;
  value: any;
};

export type WasmHookMsg = {
  wasm: {
    contract: string;
    msg: object;
  };
};

export const IBC_TRANSFER_TYPE = "/ibc.applications.transfer.v1.MsgTransfer";
export const WASM_TYPE = "/cosmwasm.wasm.v1.MsgExecuteContract";
export const CCTP_TYPE = "/circle.cctp.v1.MsgDepositForBurn";
