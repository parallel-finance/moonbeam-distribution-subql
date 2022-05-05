import { SubstrateBlock, SubstrateExtrinsic } from "@subql/types";
export declare function inputToFunctionSighash(input: string): string;
export declare function isZero(input: string): boolean;
export declare function wrapExtrinsics(wrappedBlock: SubstrateBlock): SubstrateExtrinsic[];
