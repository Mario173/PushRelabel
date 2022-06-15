import * as help from './graphHelpers';
import { pushExcessScaling, relabel } from './commonOperations';

export const excessScalingPushRelabel = (graph) => {
    let deltaScale = Math.pow(2, Math.ceil(Math.log(help.maxValue(graph.arcs, 'capacity'))));

    graph.arcs = help.setInitialFlow(graph.arcs, deltaScale);
    graph.nodes = help.setInitialHeight(graph.nodes);

    graph.nodes = help.setExcess(graph.nodes, graph.arcs);

    while( deltaScale >= 1 ) {
        let maxExcess = help.maxValue(graph.nodes.filter(elem => elem.label !== 0 && elem.label !== graph.nodes.length - 1), 'excess');
        while( maxExcess > deltaScale / 2 ) {
            let currNode = help.highExcessSmallestHeight(graph.nodes, deltaScale);
            let admissibleArcIndex = help.admissibleArc(currNode.label, graph.arcs, graph.nodes, true, deltaScale);
            if(currNode.label !== -1 && admissibleArcIndex !== -1) {
                let diffEndNode = deltaScale - graph.nodes[graph.arcs[admissibleArcIndex].endNode - 1].excess;
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