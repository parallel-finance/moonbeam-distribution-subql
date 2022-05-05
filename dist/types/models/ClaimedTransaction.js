"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimedTransaction = void 0;
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
class ClaimedTransaction {
    constructor(id) {
        this.id = id;
    }
    async save() {
        let id = this.id;
        (0, assert_1.default)(id !== null, "Cannot save ClaimedTransaction entity without an ID");
        await store.set('ClaimedTransaction', id.toString(), this);
    }
    static async remove(id) {
        (0, assert_1.default)(id !== null, "Cannot remove ClaimedTransaction entity without an ID");
        await store.remove('ClaimedTransaction', id.toString());
    }
    static async get(id) {
        (0, assert_1.default)((id !== null && id !== undefined), "Cannot get ClaimedTransaction entity without an ID");
        const record = await store.get('ClaimedTransaction', id.toString());
        if (record) {
            return ClaimedTransaction.create(record);
        }
        else {
            return;
        }
    }
    static async getByTxHash(txHash) {
        const records = await store.getByField('ClaimedTransaction', 'txHash', txHash);
        return records.map(record => ClaimedTransaction.create(record));
    }
    static async getByFrom(from) {
        const records = await store.getByField('ClaimedTransaction', 'from', from);
        return records.map(record => ClaimedTransaction.create(record));
    }
    static async getByTo(to) {
        const records = await store.getByField('ClaimedTransaction', 'to', to);
        return records.map(record => ClaimedTransaction.create(record));
    }
    static async getByFunc(func) {
        const records = await store.getByField('ClaimedTransaction', 'func', func);
        return records.map(record => ClaimedTransaction.create(record));
    }
    static create(record) {
        (0, assert_1.default)(typeof record.id === 'string', "id must be provided");
        let entity = new ClaimedTransaction(record.id);
        Object.assign(entity, record);
        return entity;
    }
}
exports.ClaimedTransaction = ClaimedTransaction;
