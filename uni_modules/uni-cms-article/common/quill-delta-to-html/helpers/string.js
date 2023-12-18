function tokenizeWithNewLines(str) {
    const NewLine = '\n';
    if (str === NewLine) {
        return [str];
    }
    var lines = str.split(NewLine);
    if (lines.length === 1) {
        return lines;
    }
    var lastIndex = lines.length - 1;
    return lines.reduce((pv, line, ind) => {
        if (ind !== lastIndex) {
            if (line !== '') {
                pv = pv.concat(line, NewLine);
            }
            else {
                pv.push(NewLine);
            }
        }
        else if (line !== '') {
            pv.push(line);
        }
        return pv;
    }, []);
}
export { tokenizeWithNewLines };
