import { OpToHtmlConverter, } from './OpToHtmlConverter';
import { VideoItem, BlockGroup, ListGroup, BlotBlock, TableGroup, } from './grouper/group-types';
import { makeStartTag, makeEndTag, encodeHtml } from './funcs-html';
import { GroupType } from './value-types';
import { QuillDeltaConverter } from './QuillDeltaConverter';
import { OpToJsonConverter } from './OpToJsonConverter';
const BrTag = '<br/>';
class QuillDeltaToJsonConverter extends QuillDeltaConverter {
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
        return [].concat.apply([], groups
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
        }));
    }
    _renderList(list) {
        var firstItem = list.items[0];
        return {
            type: 'list',
            data: {
                type: firstItem.item.op.attributes.list,
                items: list.items.map((li) => this._renderListItem(li))
            }
        };
    }
    _renderListItem(li) {
        li.item.op.attributes.indent = 0;
        return this._renderInlines(li.item.ops, false);
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
        const texts = ops.reduce((acc, op, i) => {
            if (i > 0 && i === opsLen && op.isJustNewline()) {
                return acc;
            }
            if (!acc[acc.length - 1]) {
                acc.push([]);
            }
            if (op.isJustNewline()) {
                acc.push([]);
                return acc;
            }
            else {
                acc[acc.length - 1].push({
                    value: op.insert.value,
                    attributes: op.attributes
                });
                return acc;
            }
        }, []);
        if (!isInlineGroup) {
            return texts;
        }
        return texts.map((v) => {
            return {
                type: 'paragraph',
                data: v
            };
        });
    }
    _renderInline(op, contextOp) {
        if (op.isCustomEmbed()) {
            return this._renderCustom(op, contextOp);
        }
        var converter = new OpToJsonConverter(op, this.converterOptions);
        return converter.getHtml();
    }
    _renderCustom(op, contextOp) {
        var renderCb = this.callbacks['renderCustomOp_cb'];
        if (typeof renderCb === 'function') {
            return renderCb.apply(null, [op, contextOp]);
        }
        return '';
    }
}
export { QuillDeltaToJsonConverter };
