import { DeltaInsertOp } from './../DeltaInsertOp';
import { flatten, groupConsecutiveElementsWhile, sliceFromReverseWhile, } from './../helpers/array';
import { VideoItem, InlineGroup, BlockGroup, BlotBlock, } from './group-types';
class Grouper {
    static pairOpsWithTheirBlock(ops) {
        let result = [];
        const canBeInBlock = (op) => {
            return !(op.isJustNewline() ||
                op.isCustomEmbedBlock() ||
                op.isVideo() ||
                op.isContainerBlock());
        };
        const isInlineData = (op) => op.isInline();
        let lastInd = ops.length - 1;
        let opsSlice;
        for (var i = lastInd; i >= 0; i--) {
            let op = ops[i];
            if (op.isVideo()) {
                result.push(new VideoItem(op));
            }
            else if (op.isCustomEmbedBlock()) {
                result.push(new BlotBlock(op));
            }
            else if (op.isContainerBlock()) {
                opsSlice = sliceFromReverseWhile(ops, i - 1, canBeInBlock);
                result.push(new BlockGroup(op, opsSlice.elements));
                i = opsSlice.sliceStartsAt > -1 ? opsSlice.sliceStartsAt : i;
            }
            else {
                opsSlice = sliceFromReverseWhile(ops, i - 1, isInlineData);
                result.push(new InlineGroup(opsSlice.elements.concat(op)));
                i = opsSlice.sliceStartsAt > -1 ? opsSlice.sliceStartsAt : i;
            }
        }
        result.reverse();
        return result;
    }
    static groupConsecutiveSameStyleBlocks(groups, blocksOf = {
        header: true,
        codeBlocks: true,
        blockquotes: true,
        customBlocks: true,
    }) {
        return groupConsecutiveElementsWhile(groups, (g, gPrev) => {
            if (!(g instanceof BlockGroup) || !(gPrev instanceof BlockGroup)) {
                return false;
            }
            return ((blocksOf.codeBlocks &&
                Grouper.areBothCodeblocksWithSameLang(g, gPrev)) ||
                (blocksOf.blockquotes &&
                    Grouper.areBothBlockquotesWithSameAdi(g, gPrev)) ||
                (blocksOf.header &&
                    Grouper.areBothSameHeadersWithSameAdi(g, gPrev)) ||
                (blocksOf.customBlocks &&
                    Grouper.areBothCustomBlockWithSameAttr(g, gPrev)));
        });
    }
    static reduceConsecutiveSameStyleBlocksToOne(groups) {
        var newLineOp = DeltaInsertOp.createNewLineOp();
        return groups.map(function (elm) {
            if (!Array.isArray(elm)) {
                if (elm instanceof BlockGroup && !elm.ops.length) {
                    elm.ops.push(newLineOp);
                }
                return elm;
            }
            var groupsLastInd = elm.length - 1;
            elm[0].ops = flatten(elm.map((g, i) => {
                if (!g.ops.length) {
                    return [newLineOp];
                }
                return g.ops.concat(i < groupsLastInd ? [newLineOp] : []);
            }));
            return elm[0];
        });
    }
    static areBothCodeblocksWithSameLang(g1, gOther) {
        return (g1.op.isCodeBlock() &&
            gOther.op.isCodeBlock() &&
            g1.op.hasSameLangAs(gOther.op));
    }
    static areBothSameHeadersWithSameAdi(g1, gOther) {
        return g1.op.isSameHeaderAs(gOther.op) && g1.op.hasSameAdiAs(gOther.op);
    }
    static areBothBlockquotesWithSameAdi(g, gOther) {
        return (g.op.isBlockquote() &&
            gOther.op.isBlockquote() &&
            g.op.hasSameAdiAs(gOther.op));
    }
    static areBothCustomBlockWithSameAttr(g, gOther) {
        return (g.op.isCustomTextBlock() &&
            gOther.op.isCustomTextBlock() &&
            g.op.hasSameAttr(gOther.op));
    }
}
export { Grouper };
