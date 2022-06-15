import * as help from './graphHelpers';
import { discharge } from './commonOperations';

export const fifoPushRelabel = (graph) => {
    graph.arcs = help.setInitialFlow(graph.arcs);
    graph.nodes = help.setInitialHeight(graph.nodes);

    graph.nodes = help.setExcess(graph.nodes, graph.arcs);

    let activeNodes = help.findAllActive(graph.nodes);

    while( activeNodes !== undefined && activeNodes.length !== 0 ) {
        let currNode = activeNodes[0];
        activeNodes.shift();
        discharge(graph, activeNodes, currNode.label);
    }

    return graph;
};