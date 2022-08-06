/* Metoda koja postavlja početne vrijednosti toka svih bridova na početku izvođenja guraj-promijeni visinu algoritma */
export const setInitialFlow = (edges) => {
    for(let i = 0; i < edges.length; i += 2) {
        if(edges[i].startNode === 1) {
            edges[i].flow = edges[i].capacity;
            edges[i + 1].flow = (-1) * edges[i].capacity;
        }
    }
    return edges;
};

/* Metoda koja postavlja početne vrijednosti visine svih vrhova na početku izvođenja guraj-promijeni visinu algoritma */
export const setInitialHeight = (nodes) => {
    nodes[0].height = nodes.length;
    return nodes;
}

/* Metoda koja postavlja vrijednost viška svih vrhova */
export const setExcess = (nodes, edges) => {
    for(let i = 1; i < nodes.length; i++) {
        nodes[i - 1].excess = 0;
        for(let edge of edges) {
            if(edge.endNode === i) {
                nodes[i - 1].excess += edge.flow;
            }
        }
    }
    return nodes;
};

/* Metoda koja računa ukupni višak u grafu (algoritam staje kada je ukupni višak 0) */
export const excessSum = (nodes, isWaveScaling) => nodes.reduce((partialSum, elem) => partialSum + ( isWaveScaling && (elem.label == nodes.length - 1) ? 0 : elem.excess ), -nodes[0].excess);

/* Metoda koja pronalazi prvi aktivni vrh u grafu */
export const findFirstActive = (nodes) => nodes.findIndex(elem => isNodeActive(nodes.length, elem));

/* Metoda koja pronalazi sve aktivne vrhove u grafu */
export const findAllActive = (nodes) => nodes.filter(elem => isNodeActive(nodes.length, elem));

/* Metoda koja pronalazi prvi dopustivi brid za određeni vrh */
export const admissibleEdge = (i, edges, nodes, isExcessScaling=false, deltaScale=0) => {
    for(let edgeInd in edges) {
        if(edges[edgeInd].startNode === i + 1
            && nodes[edges[edgeInd].endNode - 1].height === nodes[i].height - 1
            && edges[edgeInd].flow !== edges[edgeInd].capacity
            && ( isExcessScaling ? deltaScale > nodes[edges[edgeInd].endNode - 1].excess : true ) ) {
            return parseInt(edgeInd);
        }
    }
    return -1;
};

/* Metoda koja provjerava je li vrh aktivan */
export const isNodeActive = (numOfNodes, node) => node.label !== 0 && node.label !== numOfNodes - 1 && node.excess > 0;

/* Metoda koja pronalazi najveću vrijednost u nizu objekata */
export const maxValue = (arr, value) => Math.max(...arr.map(elem => elem[value]));

/* Metoda koja pronalazi vrh najmanje visine među vrhovima koji imaju višak veći od delta/2 */
export const highExcessSmallestHeight = (nodes, deltaScale) => nodes.filter(elem => elem.excess > deltaScale / 2).reduce((min, elem) => elem.height < min.height ? elem : min);

/* Metoda koja provjerava je li dani brid dopustiv */
export const isAdmissible = (edge, nodes) => nodes[edge.endNode - 1].height === nodes[edge.startNode - 1].height - 1 && edge.flow !== edge.capacity;