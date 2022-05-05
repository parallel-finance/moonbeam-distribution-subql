import { SubstrateBlock } from "@subql/types";
import { MoonbeamCall } from "@subql/contract-processors/dist/moonbeam";
export declare function handleBlock(block: SubstrateBlock): Promise<void>;
export declare function handleEvmTransaction(idx: string, tx: MoonbeamCall): Promise<void>;
