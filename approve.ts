import { BigNumber, ethers, utils } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import * as dotenv from 'dotenv';
dotenv.config();

const WETHContractAddress = process.env.WETHContractAddress!
const aUSDContractAddress = process.env.aUSDContractAddress!

const ethRpcEndPoint = process.env.ethRpcEndPoint!
const avaxRpcEndPoint = process.env.avaxRpcEndPoint!

const wethApprovalAmmont: BigNumber = parseUnits("1000000000000000000000", 18)
const ausdcApprovalAmmont: BigNumber = parseUnits("100000000000000000000", 6)

const privateKey = process.env.privateKey!
const squidContractAddress = process.env.squidContractAddress!


async function approveToken(_tokenAddress: string, _rpc: string, _approvalAmount: BigNumber) {
    const provider = new ethers.providers.JsonRpcProvider(
        _rpc
    );

    const signer = new ethers.Wallet(
        privateKey,
        provider
    );
    // token contract abi
    const abi = [
        "function approve(address _spender, uint256 _value) public returns (bool success)",
    ];

    const contract = new ethers.Contract(
        _tokenAddress,
        abi,
        signer
    );
    await contract.approve(
        squidContractAddress,
        _approvalAmount
    );
}

async function main() {
    console.log('approving weth on eth')
    await approveToken(WETHContractAddress, ethRpcEndPoint, wethApprovalAmmont);
    console.log('approving ausdc on eth')
    await approveToken(aUSDContractAddress, ethRpcEndPoint, ausdcApprovalAmmont);
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
