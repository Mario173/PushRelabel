import * as help from './graphHelpers';
import { push, relabel } from './commonOperations';


export const pushRelabel = (graph) => {
    graph.arcs = help.setInitialFlow(graph.arcs);
    graph.nodes = help.setInitialHeight(graph.nodes);

    graph.nodes = help.setExcess(graph.nodes, graph.arcs);

    while( help.excessSum(graph.nodes) !== 0 ) {
        let startNodeIndex = help.findFirstActive(graph.nodes);
        let admissibleArcIndex = help.admissibleArc(startNodeIndex, graph.arcs, graph.nodes);
        if(startNodeIndex !== -1 && admissibleArcIndex !== -1) {
            push(graph, startNodeIndex, admissibleArcIndex);
        } else {
            relabel(graph, startNodeIndex);
        }
    }

    return graph;
};