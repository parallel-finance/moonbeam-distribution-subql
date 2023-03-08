// Follow https://github.com/parallel-finance/acala-distribution-subql/blob/e8514498b5f487199a5d74f80ac8dbc8be374e4f/src/mappings/mappingHandlers.ts
import { SubstrateEvent } from "@subql/types";
import { ClaimTx, DistributionTx, TotalClaim, TotalDistribution } from "../types";

type Tx = {
    id: string; // tx hash
    from: string;
    to: string;
    amount: string;
    blockHeight: number;
    timestamp: Date;
};

const DISTRIBUTION_ADDRESS = '253yWsbUYxYqDXX7Ug8WzDeWtTNgFEsrz5xhgHAFnggJj4Pm';

const isDistributionTx = (from: string) => from === DISTRIBUTION_ADDRESS

const isClaimTx = (to: string) => to === DISTRIBUTION_ADDRESS

async function handleDistribution(tx: Tx): Promise<void> {
    try {
        logger.info(`handle distribution call ${tx.blockHeight}-${tx.id}`)
        let txKey = tx.blockHeight + '-' + tx.id
        let disTransaction = await DistributionTx.get(txKey);
        if (disTransaction !== undefined) {
            logger.warn(`distribution tx [${txKey}] has been recorded`);
            return;
        }
        disTransaction = DistributionTx.create(tx)
        logger.info(`vest transaction ${disTransaction.from}, amount ${disTransaction.amount}`);

        let totalDistributed = await TotalDistribution.get(tx.from);
        if (totalDistributed === undefined) {
            totalDistributed = TotalDistribution.create({
                id: tx.from,
                amount: "0",
                blockHeight: tx.blockHeight,
                lastUpdated: tx.blockHeight,
                count: 0,
            });
        }
        totalDistributed.amount = (BigInt(totalDistributed.amount) + BigInt(tx.amount)).toString();
        totalDistributed.count = totalDistributed.count + 1;
        totalDistributed.lastUpdated = tx.blockHeight;

        await Promise.all([
            disTransaction.save(),
            totalDistributed.save(),
        ]);
        return
    } catch (e) {
        logger.error(`handle account[${tx.from}] total distribution error: %o`, e);
        throw e;
    }
}

async function handleClaim(tx: Tx): Promise<void> {
    try {
        logger.info(`handle claim call ${tx.blockHeight}-${tx.id}`)
        let txKey = tx.blockHeight + '-' + tx.id
        let claimTransaction = await ClaimTx.get(txKey);
        if (claimTransaction !== undefined) {
            logger.warn(`claim tx [${txKey}] has been recorded`);
            return;
        }
        claimTransaction = ClaimTx.create(tx)
        logger.info(`claim transaction ${tx.to}, amount ${claimTransaction.amount}`);
        let totalClaimed = await TotalClaim.get(tx.to);
        if (totalClaimed === undefined) {
            totalClaimed = TotalClaim.create({
                id: tx.to,
                amount: tx.amount,
                blockHeight: tx.blockHeight,
                lastUpdated: tx.blockHeight,
                count: 0,
            });
        }
        totalClaimed.amount = (BigInt(totalClaimed.amount) + BigInt(tx.amount)).toString();
        totalClaimed.count = totalClaimed.count + 1;
        totalClaimed.lastUpdated = tx.blockHeight;

        await Promise.all([
            claimTransaction.save(),
            totalClaimed.save(),
        ]);
        return
    } catch (e) {
        logger.error(`handle account[${tx.to}] total claim error: %o`, e);
        throw e;
    }
}

export async function handleTransferEvent(event: SubstrateEvent): Promise<void> {
    try {
        const {
            event: {
                data: [signer, dest, value]
            },
        } = event;
        const from = signer.toString()
        const to = dest.toString()
        const isDistribution = isDistributionTx(from);
        const isClaim = isClaimTx(to);

        if (!isDistribution && !isClaim) return

        const idx = event.idx;
        const blockNumber = event.block.block.header.number.toNumber();
        const txHash = event.extrinsic.extrinsic.hash.toString()
        const amount = value.toString()

        const tx: Tx = {
            id: `${txHash}-${idx}`,
            from,
            to,
            amount,
            blockHeight: blockNumber,
            timestamp: event.block.timestamp,
        };
        if (isDistribution) {
            await handleDistribution(tx);
        } else if (isClaim) {
            await handleClaim(tx);
        }
    } catch (e) {
        logger.error(`handle transfer event error: %o`, e);
        throw e;
    }
}