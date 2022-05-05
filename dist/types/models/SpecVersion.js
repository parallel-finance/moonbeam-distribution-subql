"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecVersion = void 0;
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
class SpecVersion {
    constructor(id) {
        this.id = id;
    }
    async save() {
        let id = this.id;
        (0, assert_1.default)(id !== null, "Cannot save SpecVersion entity without an ID");
        await store.set('SpecVersion', id.toString(), this);
    }
    static async remove(id) {
        (0, assert_1.default)(id !== null, "Cannot remove SpecVersion entity without an ID");
        await store.remove('SpecVersion', id.toString());
    }
    static async get(id) {
        (0, assert_1.default)((id !== null && id !== undefined), "Cannot get SpecVersion entity without an ID");
        const record = await store.get('SpecVersion', id.toString());
        if (record) {
            return SpecVersion.create(record);
        }
        else {
            return;
        }
    }
    static create(record) {
        (0, assert_1.default)(typeof record.id === 'string', "id must be provided");
        let entity = new SpecVersion(record.id);
        Object.assign(entity, record);
        return entity;
    }
}
exports.SpecVersion = SpecVersion;
