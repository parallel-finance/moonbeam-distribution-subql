"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TotalClaimed = void 0;
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
class TotalClaimed {
    constructor(id) {
        this.id = id;
    }
    async save() {
        let id = this.id;
        (0, assert_1.default)(id !== null, "Cannot save TotalClaimed entity without an ID");
        await store.set('TotalClaimed', id.toString(), this);
    }
    static async remove(id) {
        (0, assert_1.default)(id !== null, "Cannot remove TotalClaimed entity without an ID");
        await store.remove('TotalClaimed', id.toString());
    }
    static async get(id) {
        (0, assert_1.default)((id !== null && id !== undefined), "Cannot get TotalClaimed entity without an ID");
        const record = await store.get('TotalClaimed', id.toString());
        if (record) {
            return TotalClaimed.create(record);
        }
        else {
            return;
        }
    }
    static create(record) {
        (0, assert_1.default)(typeof record.id === 'string', "id must be provided");
        let entity = new TotalClaimed(record.id);
        Object.assign(entity, record);
        return entity;
    }
}
exports.TotalClaimed = TotalClaimed;
