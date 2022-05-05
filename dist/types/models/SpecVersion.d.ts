import { Entity, FunctionPropertyNames } from "@subql/types";
declare type SpecVersionProps = Omit<SpecVersion, NonNullable<FunctionPropertyNames<SpecVersion>>>;
export declare class SpecVersion implements Entity {
    constructor(id: string);
    id: string;
    blockHeight: bigint;
    save(): Promise<void>;
    static remove(id: string): Promise<void>;
    static get(id: string): Promise<SpecVersion | undefined>;
    static create(record: SpecVersionProps): SpecVersion;
}
export {};
