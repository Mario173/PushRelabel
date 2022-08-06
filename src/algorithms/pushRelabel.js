import * as help from './graphHelpers';
import { push, relabel } from './commonOperations';


export const pushRelabel = (graph) => {
    graph.edges = help.setInitialFlow(graph.edges);
    graph.nodes = help.setInitialHeight(graph.nodes);

    graph.nodes = help.setExcess(graph.nodes, graph.edges);

    while( help.excessSum(graph.nodes) !== 0 ) {
        let startNodeIndex = help.findFirstActive(graph.nodes);
        let admissibleEdgeIndex = help.admissibleEdge(startNodeIndex, graph.edges, graph.nodes);
        if(startNodeIndex !== -1 && admissibleEdgeIndex !== -1) {
            push(graph, startNodeIndex, admissibleEdgeIndex);
        } else {
            relabel(graph, startNodeIndex);
        }
    }

    return graph;
};