import { setExcess, isNodeActive, admissibleEdge, isAdmissible } from "./graphHelpers";

export const push = (graph, startNodeIndex, admissibleEdgeIndex) => {
    let delta = Math.min(graph.nodes[startNodeIndex].excess, graph.edges[admissibleEdgeIndex].capacity - graph.edges[admissibleEdgeIndex].flow);
    graph.edges[admissibleEdgeIndex].flow += delta;
    graph.edges[admissibleEdgeIndex + (admissibleEdgeIndex % 2 === 0 ? 1 : -1)].flow -= delta;
    setExcess(graph.nodes, graph.edges);
};

export const relabel = (graph, i) => {
    let positiveResidualEdges = graph.edges.filter(curr => curr.startNode === i + 1 && curr.flow !== curr.capacity);
    let neighbourNodesIndexes = positiveResidualEdges.map(elem => elem.startNode === i + 1 ? elem.endNode : elem.startNode);
    let neighbourNodes = neighbourNodesIndexes.map(elem => graph.nodes[elem - 1].height);
    graph.nodes[i].height = Math.min(...neighbourNodes) + 1;
};

export const pushWithDischarge = (graph, startNodeIndex, admissibleEdgeIndex, activeNodes) => {
    let delta = Math.min(graph.nodes[startNodeIndex].excess, graph.edges[admissibleEdgeIndex].capacity - graph.edges[admissibleEdgeIndex].flow);
    graph.edges[admissibleEdgeIndex].flow += delta;
    graph.edges[admissibleEdgeIndex + (admissibleEdgeIndex % 2 === 0 ? 1 : -1)].flow -= delta;
    setExcess(graph.nodes, graph.edges);

    let endNode = graph.nodes[graph.edges[admissibleEdgeIndex].endNode - 1];
    if(isNodeActive(graph.nodes.length, endNode) && (!activeNodes.includes(endNode))) {
        activeNodes.push(endNode);
    }
};

export const discharge = (graph, activeNodes, i) => {
    while( graph.nodes[i].excess > 0 ) {
        let nextEdge = admissibleEdge(i, graph.edges, graph.nodes);
        while( nextEdge !== -1 && graph.nodes[i].excess !== 0 ) {
            pushWithDischarge(graph, i, nextEdge, activeNodes);
            nextEdge = admissibleEdge(i, graph.edges, graph.nodes);
        }
        if( graph.nodes[i].excess > 0 ) {
            relabel(graph, i);
        }
    }
};

export const pushExcessScaling = (graph, startNodeIndex, admissibleEdgeIndex, diffEndNode) => {
    let delta = Math.min(graph.nodes[startNodeIndex].excess, graph.edges[admissibleEdgeIndex].capacity - graph.edges[admissibleEdgeIndex].flow, diffEndNode);
    delta = delta < 0 ? 0 : delta;
    graph.edges[admissibleEdgeIndex].flow += delta;
    graph.edges[admissibleEdgeIndex + (admissibleEdgeIndex % 2 === 0 ? 1 : -1)].flow -= delta;
    setExcess(graph.nodes, graph.edges);
};

export const stackPush = (graph, node, deltaScale) => {
    let stack = [node];
    while( stack.length > 0 ) {
        let currNode = stack.at(-1);
        let edgesOutOfCurrNode = graph.edges.filter(elem => elem.startNode - 1 === currNode.label);
        for(let [index, edge] of edgesOutOfCurrNode.entries()) {
            if( !isAdmissible(edge, graph.nodes) ) {
                if(index === edgesOutOfCurrNode.length - 1) {
                    stack.splice(stack.indexOf(currNode), 1);
                    relabel(graph, currNode.label);
                    graph.nodes[currNode.label].notYetRelabeled = false;
                }
            } else if(graph.nodes[edge.endNode - 1].excess >= deltaScale / 2 && edge.endNode !== graph.nodes.length) {
                stack.push(graph.nodes[edge.endNode - 1]);
            } else {
                let edgeIndex = graph.edges.indexOf(edge);
                pushExcessScaling(graph, currNode.label, edgeIndex, deltaScale - graph.nodes[edge.endNode - 1].excess);
                if(graph.nodes[currNode.label].excess === 0) {
                    stack.splice(stack.indexOf(currNode), 1);
                }
            }
        }
    }
};