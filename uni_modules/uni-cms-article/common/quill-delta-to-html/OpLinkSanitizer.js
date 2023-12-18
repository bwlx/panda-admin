import * as url from './helpers/url';
import { encodeLink } from './funcs-html';
class OpLinkSanitizer {
    static sanitize(link, options) {
        let sanitizerFn = () => {
            return undefined;
        };
        if (options && typeof options.urlSanitizer === 'function') {
            sanitizerFn = options.urlSanitizer;
        }
        let result = sanitizerFn(link);
        return typeof result === 'string' ? result : encodeLink(url.sanitize(link));
    }
}
export { OpLinkSanitizer };
