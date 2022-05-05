import { Entity, FunctionPropertyNames } from "@subql/types";
declare type DistributedTransactionProps = Omit<DistributedTransaction, NonNullable<FunctionPropertyNames<DistributedTransaction>>>;
export declare class DistributedTransaction implements Entity {
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
    static get(id: string): Promise<DistributedTransaction | undefined>;
    static getByTxHash(txHash: string): Promise<DistributedTransaction[] | undefined>;
    static getByFrom(from: string): Promise<DistributedTransaction[] | undefined>;
    static getByTo(to: string): Promise<DistributedTransaction[] | undefined>;
    static getByFunc(func: string): Promise<DistributedTransaction[] | undefined>;
    static create(record: DistributedTransactionProps): DistributedTransaction;
}
export {};
