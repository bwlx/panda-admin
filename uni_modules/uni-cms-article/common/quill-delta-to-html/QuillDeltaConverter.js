import { InsertOpsConverter } from './InsertOpsConverter';
import { Grouper } from './grouper/Grouper';
import { ListNester } from './grouper/ListNester';
import * as obj from './helpers/object';
import { TableGrouper } from './grouper/TableGrouper';
class QuillDeltaConverter {
    constructor(deltaOps, options) {
        this.rawDeltaOps = [];
        this.callbacks = {};
        this.options = obj.assign({
            paragraphTag: 'p',
            encodeHtml: true,
            classPrefix: 'ql',
            inlineStyles: false,
            multiLineBlockquote: true,
            multiLineHeader: true,
            multiLineCodeblock: true,
            multiLineParagraph: true,
            multiLineCustomBlock: true,
            allowBackgroundClasses: false,
            linkTarget: '_blank',
        }, options, {
            orderedListTag: 'ol',
            bulletListTag: 'ul',
            listItemTag: 'li',
        });
        var inlineStyles;
        if (!this.options.inlineStyles) {
            inlineStyles = undefined;
        }
        else if (typeof this.options.inlineStyles === 'object') {
            inlineStyles = this.options.inlineStyles;
        }
        else {
            inlineStyles = {};
        }
        this.converterOptions = {
            encodeHtml: this.options.encodeHtml,
            classPrefix: this.options.classPrefix,
            inlineStyles: inlineStyles,
            listItemTag: this.options.listItemTag,
            paragraphTag: this.options.paragraphTag,
            linkRel: this.options.linkRel,
            linkTarget: this.options.linkTarget,
            allowBackgroundClasses: this.options.allowBackgroundClasses,
            customTag: this.options.customTag,
            customTagAttributes: this.options.customTagAttributes,
            customCssClasses: this.options.customCssClasses,
            customCssStyles: this.options.customCssStyles,
        };
        this.rawDeltaOps = deltaOps;
    }
    getGroupedOps() {
        var deltaOps = InsertOpsConverter.convert(this.rawDeltaOps, this.options);
        var pairedOps = Grouper.pairOpsWithTheirBlock(deltaOps);
        var groupedSameStyleBlocks = Grouper.groupConsecutiveSameStyleBlocks(pairedOps, {
            blockquotes: !!this.options.multiLineBlockquote,
            header: !!this.options.multiLineHeader,
            codeBlocks: !!this.options.multiLineCodeblock,
            customBlocks: !!this.options.multiLineCustomBlock,
        });
        var groupedOps = Grouper.reduceConsecutiveSameStyleBlocksToOne(groupedSameStyleBlocks);
        var tableGrouper = new TableGrouper();
        groupedOps = tableGrouper.group(groupedOps);
        var listNester = new ListNester();
        return listNester.nest(groupedOps);
    }
    convert() { }
    _renderWithCallbacks(groupType, group, myRenderFn) {
        var html = '';
        var beforeCb = this.callbacks['beforeRender_cb'];
        html =
            typeof beforeCb === 'function'
                ? beforeCb.apply(null, [groupType, group])
                : '';
        if (!html) {
            html = myRenderFn();
        }
        var afterCb = this.callbacks['afterRender_cb'];
        html =
            typeof afterCb === 'function'
                ? afterCb.apply(null, [groupType, html])
                : html;
        return html;
    }
    beforeRender(cb) {
        if (typeof cb === 'function') {
            this.callbacks['beforeRender_cb'] = cb;
        }
    }
    afterRender(cb) {
        if (typeof cb === 'function') {
            this.callbacks['afterRender_cb'] = cb;
        }
    }
    renderCustomWith(cb) {
        this.callbacks['renderCustomOp_cb'] = cb;
    }
}
export { QuillDeltaConverter };
