import { OpToHtmlConverter, } from './OpToHtmlConverter';
import { VideoItem, BlockGroup, ListGroup, BlotBlock, TableGroup, } from './grouper/group-types';
import { makeStartTag, makeEndTag, encodeHtml } from './funcs-html';
import { GroupType } from './value-types';
import { QuillDeltaConverter } from './QuillDeltaConverter';
const BrTag = '<br/>';
class QuillDeltaToHtmlConverter extends QuillDeltaConverter {
    _getListTag(op) {
        return op.isOrderedList()
            ? this.options.orderedListTag + ''
            : op.isBulletList()
                ? this.options.bulletListTag + ''
                : op.isCheckedList()
                    ? this.options.bulletListTag + ''
                    : op.isUncheckedList()
                        ? this.options.bulletListTag + ''
                        : '';
    }
    convert() {
        let groups = this.getGroupedOps();
        return groups
            .map((group) => {
            if (group instanceof ListGroup) {
                return this._renderWithCallbacks(GroupType.List, group, () => this._renderList(group));
            }
            else if (group instanceof TableGroup) {
                return this._renderWithCallbacks(GroupType.Table, group, () => this._renderTable(group));
            }
            else if (group instanceof BlockGroup) {
                var g = group;
                return this._renderWithCallbacks(GroupType.Block, group, () => this._renderBlock(g.op, g.ops));
            }
            else if (group instanceof BlotBlock) {
                return this._renderCustom(group.op, null);
            }
            else if (group instanceof VideoItem) {
                return this._renderWithCallbacks(GroupType.Video, group, () => {
                    var g = group;
                    var converter = new OpToHtmlConverter(g.op, this.converterOptions);
                    return converter.getHtml();
                });
            }
            else {
                return this._renderWithCallbacks(GroupType.InlineGroup, group, () => {
                    return this._renderInlines(group.ops, true);
                });
            }
        })
            .join('');
    }
    _renderList(list) {
        var firstItem = list.items[0];
        return (makeStartTag(this._getListTag(firstItem.item.op)) +
            list.items.map((li) => this._renderListItem(li)).join('') +
            makeEndTag(this._getListTag(firstItem.item.op)));
    }
    _renderListItem(li) {
        li.item.op.attributes.indent = 0;
        var converter = new OpToHtmlConverter(li.item.op, this.converterOptions);
        var parts = converter.getHtmlParts();
        var liElementsHtml = this._renderInlines(li.item.ops, false);
        return (parts.openingTag +
            liElementsHtml +
            (li.innerList ? this._renderList(li.innerList) : '') +
            parts.closingTag);
    }
    _renderTable(table) {
        return (makeStartTag('table') +
            makeStartTag('tbody') +
            table.rows.map((row) => this._renderTableRow(row)).join('') +
            makeEndTag('tbody') +
            makeEndTag('table'));
    }
    _renderTableRow(row) {
        return (makeStartTag('tr') +
            row.cells.map((cell) => this._renderTableCell(cell)).join('') +
            makeEndTag('tr'));
    }
    _renderTableCell(cell) {
        var converter = new OpToHtmlConverter(cell.item.op, this.converterOptions);
        var parts = converter.getHtmlParts();
        var cellElementsHtml = this._renderInlines(cell.item.ops, false);
        return (makeStartTag('td', {
            key: 'data-row',
            value: cell.item.op.attributes.table,
        }) +
            parts.openingTag +
            cellElementsHtml +
            parts.closingTag +
            makeEndTag('td'));
    }
    _renderBlock(bop, ops) {
        var converter = new OpToHtmlConverter(bop, this.converterOptions);
        var htmlParts = converter.getHtmlParts();
        if (bop.isCodeBlock()) {
            return (htmlParts.openingTag +
                encodeHtml(ops
                    .map((iop) => iop.isCustomEmbed()
                    ? this._renderCustom(iop, bop)
                    : iop.insert.value)
                    .join('')) +
                htmlParts.closingTag);
        }
        var inlines = ops.map((op) => this._renderInline(op, bop)).join('');
        return htmlParts.openingTag + (inlines || BrTag) + htmlParts.closingTag;
    }
    _renderInlines(ops, isInlineGroup = true) {
        var opsLen = ops.length - 1;
        var html = ops
            .map((op, i) => {
            if (i > 0 && i === opsLen && op.isJustNewline()) {
                return '';
            }
            return this._renderInline(op, null);
        })
            .join('');
        if (!isInlineGroup) {
            return html;
        }
        let startParaTag = makeStartTag(this.options.paragraphTag);
        let endParaTag = makeEndTag(this.options.paragraphTag);
        if (html === BrTag || this.options.multiLineParagraph) {
            return startParaTag + html + endParaTag;
        }
        return (startParaTag +
            html
                .split(BrTag)
                .map((v) => {
                return v === '' ? BrTag : v;
            })
                .join(endParaTag + startParaTag) +
            endParaTag);
    }
    _renderInline(op, contextOp) {
        if (op.isCustomEmbed()) {
            return this._renderCustom(op, contextOp);
        }
        var converter = new OpToHtmlConverter(op, this.converterOptions);
        return converter.getHtml().replace(/\n/g, BrTag);
    }
    _renderCustom(op, contextOp) {
        var renderCb = this.callbacks['renderCustomOp_cb'];
        if (typeof renderCb === 'function') {
            return renderCb.apply(null, [op, contextOp]);
        }
        return '';
    }
}
export { QuillDeltaToHtmlConverter };
