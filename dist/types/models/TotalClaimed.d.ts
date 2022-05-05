import { Entity, FunctionPropertyNames } from "@subql/types";
declare type TotalClaimedProps = Omit<TotalClaimed, NonNullable<FunctionPropertyNames<TotalClaimed>>>;
export declare class TotalClaimed implements Entity {
    constructor(id: string);
    id: string;
    blockHeight: number;
    amount: string;
    save(): Promise<void>;
    static remove(id: string): Promise<void>;
    static get(id: string): Promise<TotalClaimed | undefined>;
    static create(record: TotalClaimedProps): TotalClaimed;
}
export {};
