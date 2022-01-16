import { SubstrateBlock } from "@subql/types";
import { SpecVersion, EvmTransaction, TotalClaimed } from "../types";
import MoonbeamDatasourcePlugin, { MoonbeamCall } from "@subql/contract-processors/dist/moonbeam";
import { inputToFunctionSighash, isZero, wrapExtrinsics } from "../utils";

const MAIN_REWARDS_ADDRESS = '0x3F5757Af3A9fCd2aA09856bbcC9038856aF6f8Bf';
const DISTRIBUTION_ADDRESS = '0xD65Fee206a4ea89eBBcF4694E745C597AB6F8325';

let specVersion: SpecVersion;
export async function handleBlock(block: SubstrateBlock): Promise<void> {
    if (!specVersion) {
        specVersion = await SpecVersion.get(block.specVersion.toString());
    }

    if (!specVersion || specVersion.id !== block.specVersion.toString()) {
        specVersion = new SpecVersion(block.specVersion.toString());
        specVersion.blockHeight = block.block.header.number.toBigInt();
        await specVersion.save();
    }
    const evmCalls: MoonbeamCall[] = await Promise.all(wrapExtrinsics(block).filter(ext => ext.extrinsic.method.section === 'ethereum' && ext.extrinsic.method.method === 'transact').map((ext) => MoonbeamDatasourcePlugin.handlerProcessors['substrate/MoonbeamCall'].transformer(ext, {} as any, undefined, undefined))) as any;
    evmCalls.forEach(async (call, idx) => 
        await handleEvmTransaction(`${block.block.header.number.toString()}-${idx}`, call)
    ); 
}

export async function handleEvmTransaction(idx: string, tx: MoonbeamCall): Promise<void> {
    if (!tx.hash || !tx.success) {
        return;
    }
    if (tx.from !== MAIN_REWARDS_ADDRESS || tx.to !== DISTRIBUTION_ADDRESS) {
        return;
    }
    const func = isZero(tx.data) ? undefined : inputToFunctionSighash(tx.data);
    const evmTransaction = EvmTransaction.create({
        id: idx,
        txHash: tx.hash,
        from: tx.from,
        to: tx.to,
        func,
        blockHeight: BigInt(tx.blockNumber.toString()),
        success: tx.success,
    });
    await evmTransaction.save();

    let totalClaimed = await TotalClaimed.get(DISTRIBUTION_ADDRESS);
    if (totalClaimed) {
        totalClaimed.blockHeight = BigInt(tx.blockNumber.toString());
        totalClaimed.amount = (BigInt(totalClaimed.amount) + BigInt(tx.value.toString())).toString(); 
    } else {
        totalClaimed = TotalClaimed.create({
            id: DISTRIBUTION_ADDRESS,
            blockHeight: BigInt(tx.blockNumber.toString()),
            amount: tx.value.toString(),
        })
    }
    logger.info(JSON.stringify(totalClaimed));
    await totalClaimed.save();
}
