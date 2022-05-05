import { Entity, FunctionPropertyNames } from "@subql/types";
declare type ClaimedTransactionProps = Omit<ClaimedTransaction, NonNullable<FunctionPropertyNames<ClaimedTransaction>>>;
export declare class ClaimedTransaction implements Entity {
    constructor(id: string);
    id: string;
    crowdloanId: string;
    txHash: string;
    from: string;
    to: string;
    value: string;
    func?: string;
    blockHeight: number;
    success: boolean;
    save(): Promise<void>;
    static remove(id: string): Promise<void>;
    static get(id: string): Promise<ClaimedTransaction | undefined>;
    static getByTxHash(txHash: string): Promise<ClaimedTransaction[] | undefined>;
    static getByFrom(from: string): Promise<ClaimedTransaction[] | undefined>;
    static getByTo(to: string): Promise<ClaimedTransaction[] | undefined>;
    static getByFunc(func: string): Promise<ClaimedTransaction[] | undefined>;
    static create(record: ClaimedTransactionProps): ClaimedTransaction;
}
export {};
