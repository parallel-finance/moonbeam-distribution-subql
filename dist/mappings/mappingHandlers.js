"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleEvmTransaction = exports.handleBlock = void 0;
const tslib_1 = require("tslib");
const types_1 = require("../types");
const moonbeam_1 = tslib_1.__importDefault(require("@subql/contract-processors/dist/moonbeam"));
const utils_1 = require("../utils");
const MAIN_REWARDS_ADDRESS = '0x99Ae955aB2a012f0a6605C0359049bf33e5152f0';
const DISTRIBUTION_ADDRESS = '0x323B10Ecf35F287B1dcfe48976cE1078BDA738d0';
const MOONBEAM_CROWDLOAN_ID = '2004-12KHAurRWMFJyxU57S9pQerHsKLCwvWKM1d3dKZVx7gSfkFJ-1';
const PRE_CLAIMED_AMOUNT = '4367295495494540000000000';
let specVersion;
async function handleBlock(block) {
    if (!specVersion) {
        specVersion = await types_1.SpecVersion.get(block.specVersion.toString());
    }
    if (!specVersion || specVersion.id !== block.specVersion.toString()) {
        specVersion = new types_1.SpecVersion(block.specVersion.toString());
        specVersion.blockHeight = block.block.header.number.toBigInt();
        await specVersion.save();
    }
    const evmCalls = await Promise.all((0, utils_1.wrapExtrinsics)(block).filter(ext => ext.extrinsic.method.section === 'ethereum' && ext.extrinsic.method.method === 'transact').map((ext) => moonbeam_1.default.handlerProcessors['substrate/MoonbeamCall'].transformer(ext, {}, undefined, undefined)));
    for (let idx = 0; idx < evmCalls.length; idx++) {
        await handleEvmTransaction(`${block.block.header.number.toString()}-${idx}`, evmCalls[idx]);
    }
}
exports.handleBlock = handleBlock;
async function handleEvmTransaction(idx, tx) {
    if (!tx.hash || !tx.success) {
        return;
    }
    const func = (0, utils_1.isZero)(tx.data) ? undefined : (0, utils_1.inputToFunctionSighash)(tx.data);
    // Collect distribute transaction
    if (tx.from === DISTRIBUTION_ADDRESS) {
        const disTransaction = types_1.DistributedTransaction.create({
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
        logger.info(`vest transaction: ${JSON.stringify(disTransaction)}`);
        await disTransaction.save();
        return;
    }
    // Collect the claim transaction
    if (tx.from != MAIN_REWARDS_ADDRESS || tx.to != DISTRIBUTION_ADDRESS) {
        return;
    }
    const claimedTransaction = types_1.ClaimedTransaction.create({
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
    logger.info(`claim transaction: ${JSON.stringify(claimedTransaction)}`);
    let totalClaimed = await types_1.TotalClaimed.get(DISTRIBUTION_ADDRESS);
    if (totalClaimed) {
        totalClaimed.blockHeight = tx.blockNumber;
        totalClaimed.amount = (BigInt(totalClaimed.amount) + BigInt(tx.value.toString())).toString();
    }
    else {
        totalClaimed = types_1.TotalClaimed.create({
            id: DISTRIBUTION_ADDRESS,
            blockHeight: tx.blockNumber,
            amount: (BigInt(PRE_CLAIMED_AMOUNT) + BigInt(tx.value.toString())).toString()
        });
    }
    logger.info(`totalClaimed: ${JSON.stringify(totalClaimed)}`);
    await Promise.all([
        claimedTransaction.save(),
        totalClaimed.save(),
    ]);
}
exports.handleEvmTransaction = handleEvmTransaction;
