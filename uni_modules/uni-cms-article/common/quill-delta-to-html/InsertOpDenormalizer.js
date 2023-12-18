import { NewLine } from './value-types';
import * as str from './helpers/string';
import * as obj from './helpers/object';
class InsertOpDenormalizer {
    static denormalize(op) {
        if (!op || typeof op !== 'object') {
            return [];
        }
        if (typeof op.insert === 'object' || op.insert === NewLine) {
            return [op];
        }
        let newlinedArray = str.tokenizeWithNewLines(op.insert + '');
        if (newlinedArray.length === 1) {
            return [op];
        }
        let nlObj = obj.assign({}, op, { insert: NewLine });
        return newlinedArray.map((line) => {
            if (line === NewLine) {
                return nlObj;
            }
            return obj.assign({}, op, {
                insert: line,
            });
        });
    }
}
export { InsertOpDenormalizer };
