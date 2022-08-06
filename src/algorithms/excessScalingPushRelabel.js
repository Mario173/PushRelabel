import * as help from './graphHelpers';
import { pushExcessScaling, relabel } from './commonOperations';

export const excessScalingPushRelabel = (graph) => {
    let deltaScale = Math.pow(2, Math.ceil(Math.log(help.maxValue(graph.edges, 'capacity'))));

    graph.edges = help.setInitialFlow(graph.edges, deltaScale);
    graph.nodes = help.setInitialHeight(graph.nodes);

    graph.nodes = help.setExcess(graph.nodes, graph.edges);

    while( deltaScale >= 1 ) {
        let maxExcess = help.maxValue(graph.nodes.filter(elem => elem.label !== 0 && elem.label !== graph.nodes.length - 1), 'excess');
        while( maxExcess > deltaScale / 2 ) {
            let currNode = help.highExcessSmallestHeight(graph.nodes, deltaScale);
            let admissibleArcIndex = help.admissibleEdge(currNode.label, graph.edges, graph.nodes, true, deltaScale);
            if(currNode.label !== -1 && admissibleArcIndex !== -1) {
                let diffEndNode = deltaScale - graph.nodes[graph.edges[admissibleArcIndex].endNode - 1].excess;
                pushExcessScaling(graph, currNode.label, admissibleArcIndex, diffEndNode);
            } else {
                relabel(graph, currNode.label);
            }
            maxExcess = help.maxValue(graph.nodes.filter(elem => elem.label !== 0 && elem.label !== graph.nodes.length - 1), 'excess');
        }
        deltaScale /= 2.0;
    }

    return graph;
};