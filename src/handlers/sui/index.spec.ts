import { Transaction } from "@mysten/sui/transactions";

import { ExecuteRoute } from "../../types";
import { SuiHandler } from "./index";

const SENDER = "0x" + "1".repeat(64);
const RECIPIENT = "0x" + "2".repeat(64);
const GAS_BUDGET = 2000000;

const serializeTransaction = (): string => {
  const tx = new Transaction();
  tx.setSender(SENDER);
  tx.setGasBudget(GAS_BUDGET);
  const [coin] = tx.splitCoins(tx.gas, [100]);
  tx.transferObjects([coin], RECIPIENT);
  return tx.serialize();
};

const mockSignAndExecuteTransaction = jest.fn();

const mockedSigner = {
  accounts: [{ address: SENDER }],
  features: {
    "sui:signAndExecuteTransaction": {
      signAndExecuteTransaction: mockSignAndExecuteTransaction,
    },
  },
};

const buildRoute = (fromChain: string, data: string): ExecuteRoute =>
  ({
    signer: mockedSigner,
    route: {
      params: { fromChain },
      transactionRequest: { data },
    },
  }) as unknown as ExecuteRoute;

describe("SuiHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignAndExecuteTransaction.mockResolvedValue({ digest: "0xdigest" });
  });

  describe("Transaction.from", () => {
    it("restores a serialized transaction without losing sender, gas budget or commands", () => {
      const serialized = serializeTransaction();

      const data = Transaction.from(serialized).getData();

      expect(data.sender).toEqual(SENDER);
      expect(data.gasData.budget).toEqual(String(GAS_BUDGET));
      expect(data.commands.map(command => command.$kind)).toEqual([
        "SplitCoins",
        "TransferObjects",
      ]);
    });

    it("round-trips a serialized transaction byte for byte", () => {
      const serialized = serializeTransaction();

      expect(Transaction.from(serialized).serialize()).toEqual(serialized);
    });

    it("allows mutation after restoring", () => {
      const restored = Transaction.from(serializeTransaction());

      restored.setGasBudget(3000000);

      expect(restored.getData().gasData.budget).toEqual("3000000");
    });
  });

  describe("executeRoute", () => {
    it("signs the restored transaction on the mainnet chain", async () => {
      const serialized = serializeTransaction();

      const response = await new SuiHandler().executeRoute({
        data: buildRoute("sui-mainnet", serialized),
      });

      expect(mockSignAndExecuteTransaction).toHaveBeenCalledTimes(1);
      const [args] = mockSignAndExecuteTransaction.mock.calls[0];
      expect(args.chain).toEqual("sui:mainnet");
      expect(args.account).toEqual(mockedSigner.accounts[0]);
      expect(args.transaction.serialize()).toEqual(serialized);
      expect(response).toEqual({ digest: "0xdigest" });
    });

    it("signs on the testnet chain for sui-testnet", async () => {
      await new SuiHandler().executeRoute({
        data: buildRoute("sui-testnet", serializeTransaction()),
      });

      expect(mockSignAndExecuteTransaction.mock.calls[0][0].chain).toEqual("sui:testnet");
    });

    it("throws for an unsupported chain without signing", async () => {
      await expect(
        new SuiHandler().executeRoute({ data: buildRoute("1", serializeTransaction()) }),
      ).rejects.toThrow("No Sui chain found for chainId 1");

      expect(mockSignAndExecuteTransaction).not.toHaveBeenCalled();
    });
  });
});
