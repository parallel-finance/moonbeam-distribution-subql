"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributedTransaction = void 0;
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
class DistributedTransaction {
    constructor(id) {
        this.id = id;
    }
    async save() {
        let id = this.id;
        (0, assert_1.default)(id !== null, "Cannot save DistributedTransaction entity without an ID");
        await store.set('DistributedTransaction', id.toString(), this);
    }
    static async remove(id) {
        (0, assert_1.default)(id !== null, "Cannot remove DistributedTransaction entity without an ID");
        await store.remove('DistributedTransaction', id.toString());
    }
    static async get(id) {
        (0, assert_1.default)((id !== null && id !== undefined), "Cannot get DistributedTransaction entity without an ID");
        const record = await store.get('DistributedTransaction', id.toString());
        if (record) {
            return DistributedTransaction.create(record);
        }
        else {
            return;
        }
    }
    static async getByTxHash(txHash) {
        const records = await store.getByField('DistributedTransaction', 'txHash', txHash);
        return records.map(record => DistributedTransaction.create(record));
    }
    static async getByFrom(from) {
        const records = await store.getByField('DistributedTransaction', 'from', from);
        return records.map(record => DistributedTransaction.create(record));
    }
    static async getByTo(to) {
        const records = await store.getByField('DistributedTransaction', 'to', to);
        return records.map(record => DistributedTransaction.create(record));
    }
    static async getByFunc(func) {
        const records = await store.getByField('DistributedTransaction', 'func', func);
        return records.map(record => DistributedTransaction.create(record));
    }
    static create(record) {
        (0, assert_1.default)(typeof record.id === 'string', "id must be provided");
        let entity = new DistributedTransaction(record.id);
        Object.assign(entity, record);
        return entity;
    }
}
exports.DistributedTransaction = DistributedTransaction;
