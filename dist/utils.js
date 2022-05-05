"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapExtrinsics = exports.isZero = exports.inputToFunctionSighash = void 0;
const bytes_1 = require("@ethersproject/bytes");
function inputToFunctionSighash(input) {
    return (0, bytes_1.hexDataSlice)(input, 0, 4);
}
exports.inputToFunctionSighash = inputToFunctionSighash;
function isZero(input) {
    return (0, bytes_1.stripZeros)(input).length === 0;
}
exports.isZero = isZero;
function filterExtrinsicEvents(extrinsicIdx, events) {
    return events.filter(({ phase }) => phase.isApplyExtrinsic && phase.asApplyExtrinsic.eqn(extrinsicIdx));
}
function wrapExtrinsics(wrappedBlock) {
    return wrappedBlock.block.extrinsics.map((extrinsic, idx) => {
        const events = filterExtrinsicEvents(idx, wrappedBlock.events);
        return {
            idx,
            extrinsic,
            block: wrappedBlock,
            events,
            success: getExtrinsicSuccess(events),
        };
    });
}
exports.wrapExtrinsics = wrapExtrinsics;
function getExtrinsicSuccess(events) {
    return (events.findIndex((evt) => evt.event.method === 'ExtrinsicSuccess') > -1);
}
