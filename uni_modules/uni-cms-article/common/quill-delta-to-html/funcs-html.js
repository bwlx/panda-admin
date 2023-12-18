var EncodeTarget;
(function (EncodeTarget) {
    EncodeTarget[EncodeTarget["Html"] = 0] = "Html";
    EncodeTarget[EncodeTarget["Url"] = 1] = "Url";
})(EncodeTarget || (EncodeTarget = {}));
function makeStartTag(tag, attrs = undefined) {
    if (!tag) {
        return '';
    }
    var attrsStr = '';
    if (attrs) {
        var arrAttrs = [].concat(attrs);
        attrsStr = arrAttrs
            .map(function (attr) {
            return attr.key + (attr.value ? '="' + attr.value + '"' : '');
        })
            .join(' ');
    }
    var closing = '>';
    if (tag === 'img' || tag === 'br') {
        closing = '/>';
    }
    return attrsStr ? `<${tag} ${attrsStr}${closing}` : `<${tag}${closing}`;
}
function makeEndTag(tag = '') {
    return (tag && `</${tag}>`) || '';
}
function decodeHtml(str) {
    return encodeMappings(EncodeTarget.Html).reduce(decodeMapping, str);
}
function encodeHtml(str, preventDoubleEncoding = true) {
    if (preventDoubleEncoding) {
        str = decodeHtml(str);
    }
    return encodeMappings(EncodeTarget.Html).reduce(encodeMapping, str);
}
function encodeLink(str) {
    let linkMaps = encodeMappings(EncodeTarget.Url);
    let decoded = linkMaps.reduce(decodeMapping, str);
    return linkMaps.reduce(encodeMapping, decoded);
}
function encodeMappings(mtype) {
    let maps = [
        ['&', '&amp;'],
        ['<', '&lt;'],
        ['>', '&gt;'],
        ['"', '&quot;'],
        ["'", '&#x27;'],
        ['\\/', '&#x2F;'],
        ['\\(', '&#40;'],
        ['\\)', '&#41;'],
    ];
    if (mtype === EncodeTarget.Html) {
        return maps.filter(([v, _]) => v.indexOf('(') === -1 && v.indexOf(')') === -1);
    }
    else {
        return maps.filter(([v, _]) => v.indexOf('/') === -1);
    }
}
function encodeMapping(str, mapping) {
    return str.replace(new RegExp(mapping[0], 'g'), mapping[1]);
}
function decodeMapping(str, mapping) {
    return str.replace(new RegExp(mapping[1], 'g'), mapping[0].replace('\\', ''));
}
export { makeStartTag, makeEndTag, encodeHtml, decodeHtml, encodeLink, };
