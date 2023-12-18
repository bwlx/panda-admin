class InlineGroup {
    constructor(ops) {
        this.ops = ops;
    }
}
class SingleItem {
    constructor(op) {
        this.op = op;
    }
}
class VideoItem extends SingleItem {
}
class BlotBlock extends SingleItem {
}
class BlockGroup {
    constructor(op, ops) {
        this.op = op;
        this.ops = ops;
    }
}
class ListGroup {
    constructor(items) {
        this.items = items;
    }
}
class ListItem {
    constructor(item, innerList = null) {
        this.item = item;
        this.innerList = innerList;
    }
}
class TableGroup {
    constructor(rows) {
        this.rows = rows;
    }
}
class TableRow {
    constructor(cells) {
        this.cells = cells;
    }
}
class TableCell {
    constructor(item) {
        this.item = item;
    }
}
export { VideoItem, BlotBlock, InlineGroup, BlockGroup, ListGroup, ListItem, TableGroup, TableRow, TableCell, };
