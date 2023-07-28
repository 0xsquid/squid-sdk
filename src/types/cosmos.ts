export type CosmosMsg = {
  msgTypeUrl: string;
  msg: object;
};

export type WasmHookMsg = {
  wasm: {
    contract: string;
    msg: object;
  };
};

export const IBC_TRANSFER_TYPE = "/ibc.applications.transfer.v1.MsgTransfer";
export const WASM_TYPE = "/cosmwasm.wasm.v1.MsgExecuteContract";
