import { OpLinkSanitizer } from '../OpLinkSanitizer';
class MentionSanitizer {
    static sanitize(dirtyObj, sanitizeOptions) {
        var cleanObj = {};
        if (!dirtyObj || typeof dirtyObj !== 'object') {
            return cleanObj;
        }
        if (dirtyObj.class && MentionSanitizer.IsValidClass(dirtyObj.class)) {
            cleanObj.class = dirtyObj.class;
        }
        if (dirtyObj.id && MentionSanitizer.IsValidId(dirtyObj.id)) {
            cleanObj.id = dirtyObj.id;
        }
        if (MentionSanitizer.IsValidTarget(dirtyObj.target + '')) {
            cleanObj.target = dirtyObj.target;
        }
        if (dirtyObj.avatar) {
            cleanObj.avatar = OpLinkSanitizer.sanitize(dirtyObj.avatar + '', sanitizeOptions);
        }
        if (dirtyObj['end-point']) {
            cleanObj['end-point'] = OpLinkSanitizer.sanitize(dirtyObj['end-point'] + '', sanitizeOptions);
        }
        if (dirtyObj.slug) {
            cleanObj.slug = dirtyObj.slug + '';
        }
        return cleanObj;
    }
    static IsValidClass(classAttr) {
        return !!classAttr.match(/^[a-zA-Z0-9_\-]{1,500}$/i);
    }
    static IsValidId(idAttr) {
        return !!idAttr.match(/^[a-zA-Z0-9_\-\:\.]{1,500}$/i);
    }
    static IsValidTarget(target) {
        return ['_self', '_blank', '_parent', '_top'].indexOf(target) > -1;
    }
}
export { MentionSanitizer };
