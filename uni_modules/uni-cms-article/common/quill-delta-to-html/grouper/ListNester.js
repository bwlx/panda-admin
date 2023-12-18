import { ListGroup, ListItem, BlockGroup } from './group-types';
import { flatten, groupConsecutiveElementsWhile } from './../helpers/array';
class ListNester {
    nest(groups) {
        var listBlocked = this.convertListBlocksToListGroups(groups);
        var groupedByListGroups = this.groupConsecutiveListGroups(listBlocked);
        var nested = flatten(groupedByListGroups.map((group) => {
            if (!Array.isArray(group)) {
                return group;
            }
            return this.nestListSection(group);
        }));
        var groupRootLists = groupConsecutiveElementsWhile(nested, (curr, prev) => {
            if (!(curr instanceof ListGroup && prev instanceof ListGroup)) {
                return false;
            }
            return curr.items[0].item.op.isSameListAs(prev.items[0].item.op);
        });
        return groupRootLists.map((v) => {
            if (!Array.isArray(v)) {
                return v;
            }
            var litems = v.map((g) => g.items);
            return new ListGroup(flatten(litems));
        });
    }
    convertListBlocksToListGroups(items) {
        var grouped = groupConsecutiveElementsWhile(items, (g, gPrev) => {
            return (g instanceof BlockGroup &&
                gPrev instanceof BlockGroup &&
                g.op.isList() &&
                gPrev.op.isList() &&
                g.op.isSameListAs(gPrev.op) &&
                g.op.hasSameIndentationAs(gPrev.op));
        });
        return grouped.map((item) => {
            if (!Array.isArray(item)) {
                if (item instanceof BlockGroup && item.op.isList()) {
                    return new ListGroup([new ListItem(item)]);
                }
                return item;
            }
            return new ListGroup(item.map((g) => new ListItem(g)));
        });
    }
    groupConsecutiveListGroups(items) {
        return groupConsecutiveElementsWhile(items, (curr, prev) => {
            return curr instanceof ListGroup && prev instanceof ListGroup;
        });
    }
    nestListSection(sectionItems) {
        var indentGroups = this.groupByIndent(sectionItems);
        Object.keys(indentGroups)
            .map(Number)
            .sort()
            .reverse()
            .forEach((indent) => {
            indentGroups[indent].forEach((lg) => {
                var idx = sectionItems.indexOf(lg);
                if (this.placeUnderParent(lg, sectionItems.slice(0, idx))) {
                    sectionItems.splice(idx, 1);
                }
            });
        });
        return sectionItems;
    }
    groupByIndent(items) {
        return items.reduce((pv, cv) => {
            var indent = cv.items[0].item.op.attributes.indent;
            if (indent) {
                pv[indent] = pv[indent] || [];
                pv[indent].push(cv);
            }
            return pv;
        }, {});
    }
    placeUnderParent(target, items) {
        for (var i = items.length - 1; i >= 0; i--) {
            var elm = items[i];
            if (target.items[0].item.op.hasHigherIndentThan(elm.items[0].item.op)) {
                var parent = elm.items[elm.items.length - 1];
                if (parent.innerList) {
                    parent.innerList.items = parent.innerList.items.concat(target.items);
                }
                else {
                    parent.innerList = target;
                }
                return true;
            }
        }
        return false;
    }
}
export { ListNester };
