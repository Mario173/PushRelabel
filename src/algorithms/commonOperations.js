import { setExcess, isNodeActive, admissibleArc, isAdmissible } from "./graphHelpers";

export const push = (graph, startNodeIndex, admissibleArcIndex) => {
    let delta = Math.min(graph.nodes[startNodeIndex].excess, graph.arcs[admissibleArcIndex].capacity - graph.arcs[admissibleArcIndex].flow);
    console.log('push', graph.nodes[startNodeIndex].excess, graph.arcs[admissibleArcIndex].capacity - graph.arcs[admissibleArcIndex].flow)
    graph.arcs[admissibleArcIndex].flow += delta;
    graph.arcs[admissibleArcIndex + (admissibleArcIndex % 2 === 0 ? 1 : -1)].flow -= delta;
    setExcess(graph.nodes, graph.arcs);
};

export const relabel = (graph, i) => {
    let positiveResidualArcs = graph.arcs.filter(curr => curr.startNode === i + 1 && curr.flow !== curr.capacity);
    let neighbourNodesIndexes = positiveResidualArcs.map(elem => elem.startNode === i + 1 ? elem.endNode : elem.startNode);
    let neighbourNodes = neighbourNodesIndexes.map(elem => graph.nodes[elem - 1].height);
    graph.nodes[i].height = Math.min(...neighbourNodes) + 1;
};

export const pushWithDischarge = (graph, startNodeIndex, admissibleArcIndex, activeNodes) => {
    let delta = Math.min(graph.nodes[startNodeIndex].excess, graph.arcs[admissibleArcIndex].capacity - graph.arcs[admissibleArcIndex].flow);
    graph.arcs[admissibleArcIndex].flow += delta;
    graph.arcs[admissibleArcIndex + (admissibleArcIndex % 2 === 0 ? 1 : -1)].flow -= delta;
    setExcess(graph.nodes, graph.arcs);

    let endNode = graph.nodes[graph.arcs[admissibleArcIndex].endNode - 1];
    if(isNodeActive(graph.nodes.length, endNode) && (!activeNodes.includes(endNode))) {
        activeNodes.push(endNode);
    }
};

export const discharge = (graph, activeNodes, i) => {
    while( graph.nodes[i].excess > 0 ) {
        let nextArc = admissibleArc(i, graph.arcs, graph.nodes);
        while( nextArc !== -1 && graph.nodes[i].excess !== 0 ) {
            pushWithDischarge(graph, i, nextArc, activeNodes);
            nextArc = admissibleArc(i, graph.arcs, graph.nodes);
        }
        if( graph.nodes[i].excess > 0 ) {
            relabel(graph, i);
        }
    }
};

export const pushExcessScaling = (graph, startNodeIndex, admissibleArcIndex, diffEndNode) => {
    let delta = Math.min(graph.nodes[startNodeIndex].excess, graph.arcs[admissibleArcIndex].capacity - graph.arcs[admissibleArcIndex].flow, diffEndNode);
    delta = delta < 0 ? 0 : delta;
    graph.arcs[admissibleArcIndex].flow += delta;
    graph.arcs[admissibleArcIndex + (admissibleArcIndex % 2 === 0 ? 1 : -1)].flow -= delta;
    setExcess(graph.nodes, graph.arcs);
};

export const stackPush = (graph, node, deltaScale) => {
    let stack = [node];
    while( stack.length > 0 ) {
        let currNode = stack.at(-1);
        let arcsOutOfCurrNode = graph.arcs.filter(elem => elem.startNode - 1 === currNode.label);
        for(let [index, arc] of arcsOutOfCurrNode.entries()) {
            if( !isAdmissible(arc, graph.nodes) ) {
                if(index === arcsOutOfCurrNode.length - 1) {
                    stack.splice(stack.indexOf(currNode), 1);
                    relabel(graph, currNode.label);
                    graph.nodes[currNode.label].notYetRelabeled = false;
                }
            } else if(graph.nodes[arc.endNode - 1].excess >= deltaScale / 2 && arc.endNode !== graph.nodes.length) {
                stack.push(graph.nodes[arc.endNode - 1]);
            } else {
                let arcIndex = graph.arcs.indexOf(arc);
                pushExcessScaling(graph, currNode.label, arcIndex, deltaScale - graph.nodes[arc.endNode - 1].excess);
                if(graph.nodes[currNode.label].excess === 0) {
                    stack.splice(stack.indexOf(currNode), 1);
                }
            }
        }
    }
};