import { SubstrateBlock } from "@subql/types";
import { SpecVersion, EvmTransaction, TotalClaimed } from "../types";
import MoonbeamDatasourcePlugin, { MoonbeamCall } from "@subql/contract-processors/dist/moonbeam";
import { inputToFunctionSighash, isZero, wrapExtrinsics } from "../utils";

const MAIN_REWARDS_ADDRESS = '0x3f5757af3a9fcd2aa09856bbcc9038856af6f8bf';
const DISTRIBUTION_ADDRESS = '0x51d16189a7cd896f6e4a8b264887d0f6f4d2b0eb';

const MOONBEAM_CROWDLOAN_ID = '2004-12KHAurRWMFJyxU57S9pQerHsKLCwvWKM1d3dKZVx7gSfkFJ-1';

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
    for (let idx = 0; idx < evmCalls.length; idx++) {
        await handleEvmTransaction(`${block.block.header.number.toString()}-${idx}`, evmCalls[idx]);
    }
}

export async function handleEvmTransaction(idx: string, tx: MoonbeamCall): Promise<void> {
    if (!tx.hash || !tx.success) {
        return;
    }
    const func = isZero(tx.data) ? undefined : inputToFunctionSighash(tx.data);
    // Collect vesting transaction
    if (tx.from === DISTRIBUTION_ADDRESS) {
        const evmTransaction = EvmTransaction.create({
            id: idx,
            crowdloanId: MOONBEAM_CROWDLOAN_ID,
            txHash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value.toString(),
            func,
            blockHeight: tx.blockNumber,
            success: tx.success,
        });
        logger.info(`vest transaction: ${JSON.stringify(evmTransaction)}`);
        await evmTransaction.save();
        return
    }        

    // Collect the claim transaction
    if (tx.from != MAIN_REWARDS_ADDRESS || tx.to != DISTRIBUTION_ADDRESS) {
        return;
    }
    const evmTransaction = EvmTransaction.create({
        id: idx,
        crowdloanId: MOONBEAM_CROWDLOAN_ID,
        txHash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value.toString(),
        func,
        blockHeight: tx.blockNumber,
        success: tx.success,
    });
    logger.info(`claim transaction: ${JSON.stringify(evmTransaction)}`);
    let totalClaimed = await TotalClaimed.get(DISTRIBUTION_ADDRESS);
    if (totalClaimed) {
        totalClaimed.blockHeight = tx.blockNumber;
        totalClaimed.amount = (BigInt(totalClaimed.amount) + BigInt(tx.value.toString())).toString();
    } else {
        totalClaimed = TotalClaimed.create({
            id: DISTRIBUTION_ADDRESS,
            blockHeight: tx.blockNumber,
            amount: tx.value.toString(),
        });
    }
    logger.info(`totalClaimed: ${JSON.stringify(totalClaimed)}`);

    await Promise.all([
        evmTransaction.save(),
        totalClaimed.save(),
    ]);
}
