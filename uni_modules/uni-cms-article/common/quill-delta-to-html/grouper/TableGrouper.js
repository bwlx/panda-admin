import { TableGroup, BlockGroup, TableRow, TableCell, } from './group-types';
import { groupConsecutiveElementsWhile } from '../helpers/array';
export class TableGrouper {
    group(groups) {
        var tableBlocked = this.convertTableBlocksToTableGroups(groups);
        return tableBlocked;
    }
    convertTableBlocksToTableGroups(items) {
        var grouped = groupConsecutiveElementsWhile(items, (g, gPrev) => {
            return (g instanceof BlockGroup &&
                gPrev instanceof BlockGroup &&
                g.op.isTable() &&
                gPrev.op.isTable());
        });
        return grouped.map((item) => {
            if (!Array.isArray(item)) {
                if (item instanceof BlockGroup && item.op.isTable()) {
                    return new TableGroup([new TableRow([new TableCell(item)])]);
                }
                return item;
            }
            return new TableGroup(this.convertTableBlocksToTableRows(item));
        });
    }
    convertTableBlocksToTableRows(items) {
        var grouped = groupConsecutiveElementsWhile(items, (g, gPrev) => {
            return (g instanceof BlockGroup &&
                gPrev instanceof BlockGroup &&
                g.op.isTable() &&
                gPrev.op.isTable() &&
                g.op.isSameTableRowAs(gPrev.op));
        });
        return grouped.map((item) => {
            return new TableRow(Array.isArray(item)
                ? item.map((it) => new TableCell(it))
                : [new TableCell(item)]);
        });
    }
}
