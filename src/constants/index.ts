export const uint256MaxValue =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

export const NATIVE_EVM_TOKEN_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee".toLowerCase();
export const MULTICALL_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11";
export const multicallAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "getEthBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
export const CHAINS_WITHOUT_MULTICALL = [314, 3141]; // Filecoin, & Filecoin testnet
