import { ListType, AlignType, DirectionType, ScriptType } from './value-types';
import { MentionSanitizer } from './mentions/MentionSanitizer';
import { find } from './helpers/array';
import { OpLinkSanitizer } from './OpLinkSanitizer';
class OpAttributeSanitizer {
    static sanitize(dirtyAttrs, sanitizeOptions) {
        var cleanAttrs = {};
        if (!dirtyAttrs || typeof dirtyAttrs !== 'object') {
            return cleanAttrs;
        }
        let booleanAttrs = [
            'bold',
            'italic',
            'underline',
            'strike',
            'code',
            'blockquote',
            'code-block',
            'renderAsBlock',
        ];
        let colorAttrs = ['background', 'color'];
        let { font, size, link, script, list, header, align, direction, indent, mentions, mention, width, target, rel, } = dirtyAttrs;
        let codeBlock = dirtyAttrs['code-block'];
        let sanitizedAttrs = [
            ...booleanAttrs,
            ...colorAttrs,
            'font',
            'size',
            'link',
            'script',
            'list',
            'header',
            'align',
            'direction',
            'indent',
            'mentions',
            'mention',
            'width',
            'target',
            'rel',
            'code-block',
        ];
        booleanAttrs.forEach(function (prop) {
            var v = dirtyAttrs[prop];
            if (v) {
                cleanAttrs[prop] = !!v;
            }
        });
        colorAttrs.forEach(function (prop) {
            var val = dirtyAttrs[prop];
            if (val &&
                (OpAttributeSanitizer.IsValidHexColor(val + '') ||
                    OpAttributeSanitizer.IsValidColorLiteral(val + '') ||
                    OpAttributeSanitizer.IsValidRGBColor(val + ''))) {
                cleanAttrs[prop] = val;
            }
        });
        if (font && OpAttributeSanitizer.IsValidFontName(font + '')) {
            cleanAttrs.font = font;
        }
        if (size && OpAttributeSanitizer.IsValidSize(size + '')) {
            cleanAttrs.size = size;
        }
        if (width && OpAttributeSanitizer.IsValidWidth(width + '')) {
            cleanAttrs.width = width;
        }
        if (link) {
            cleanAttrs.link = OpLinkSanitizer.sanitize(link + '', sanitizeOptions);
        }
        if (target && OpAttributeSanitizer.isValidTarget(target)) {
            cleanAttrs.target = target;
        }
        if (rel && OpAttributeSanitizer.IsValidRel(rel)) {
            cleanAttrs.rel = rel;
        }
        if (codeBlock) {
            if (OpAttributeSanitizer.IsValidLang(codeBlock)) {
                cleanAttrs['code-block'] = codeBlock;
            }
            else {
                cleanAttrs['code-block'] = !!codeBlock;
            }
        }
        if (script === ScriptType.Sub || ScriptType.Super === script) {
            cleanAttrs.script = script;
        }
        if (list === ListType.Bullet ||
            list === ListType.Ordered ||
            list === ListType.Checked ||
            list === ListType.Unchecked) {
            cleanAttrs.list = list;
        }
        if (Number(header)) {
            cleanAttrs.header = Math.min(Number(header), 6);
        }
        if (find([AlignType.Center, AlignType.Right, AlignType.Justify, AlignType.Left], (a) => a === align)) {
            cleanAttrs.align = align;
        }
        if (direction === DirectionType.Rtl) {
            cleanAttrs.direction = direction;
        }
        if (indent && Number(indent)) {
            cleanAttrs.indent = Math.min(Number(indent), 30);
        }
        if (mentions && mention) {
            let sanitizedMention = MentionSanitizer.sanitize(mention, sanitizeOptions);
            if (Object.keys(sanitizedMention).length > 0) {
                cleanAttrs.mentions = !!mentions;
                cleanAttrs.mention = mention;
            }
        }
        return Object.keys(dirtyAttrs).reduce((cleaned, k) => {
            if (sanitizedAttrs.indexOf(k) === -1) {
                cleaned[k] = dirtyAttrs[k];
            }
            return cleaned;
        }, cleanAttrs);
    }
    static IsValidHexColor(colorStr) {
        return !!colorStr.match(/^#([0-9A-F]{6}|[0-9A-F]{3})$/i);
    }
    static IsValidColorLiteral(colorStr) {
        return !!colorStr.match(/^[a-z]{1,50}$/i);
    }
    static IsValidRGBColor(colorStr) {
        const re = /^rgb\(((0|25[0-5]|2[0-4]\d|1\d\d|0?\d?\d),\s*){2}(0|25[0-5]|2[0-4]\d|1\d\d|0?\d?\d)\)$/i;
        return !!colorStr.match(re);
    }
    static IsValidFontName(fontName) {
        return !!fontName.match(/^[a-z\s0-9\- ]{1,30}$/i);
    }
    static IsValidSize(size) {
        return !!size.match(/^[a-z0-9\-]{1,20}$/i);
    }
    static IsValidWidth(width) {
        return !!width.match(/^[0-9]*(px|em|%)?$/);
    }
    static isValidTarget(target) {
        return !!target.match(/^[_a-zA-Z0-9\-]{1,50}$/);
    }
    static IsValidRel(relStr) {
        return !!relStr.match(/^[a-zA-Z\s\-]{1,250}$/i);
    }
    static IsValidLang(lang) {
        if (typeof lang === 'boolean') {
            return true;
        }
        return !!lang.match(/^[a-zA-Z\s\-\\\/\+]{1,50}$/i);
    }
}
export { OpAttributeSanitizer, };
