import * as help from './graphHelpers';
import { stackPush } from './commonOperations';

export const waveScalingPushRelabel = (graph) => {
    let deltaScale = Math.pow(2, Math.floor(Math.log(help.maxValue(graph.arcs, 'capacity')))); // pogledaj kad se vratiš
    let l = Math.sqrt(Math.log(help.maxValue(graph.arcs, 'capacity')));

    graph.arcs = help.setInitialFlow(graph.arcs, deltaScale);
    graph.nodes = help.setInitialHeight(graph.nodes);

    graph.nodes = help.setExcess(graph.nodes, graph.arcs);

    while( deltaScale >= 1 ) {
        let excessSum = help.excessSum(graph.nodes, true);
        while( excessSum >= graph.nodes.length * deltaScale / l ) {
            graph.nodes = graph.nodes.map(elem => { return {...elem, notYetRelabeled: true} });
            let sortedNodes = graph.nodes.filter(elem => elem.label !== 0 && elem.label !== graph.nodes.length - 1).sort((prev, curr) => prev.height < curr.height);
            for(let node of sortedNodes) {
                if(node.excess > 0 && node.notYetRelabeled) {
                    stackPush(graph, node, deltaScale);
                }
            }
            excessSum = help.excessSum(graph.nodes);
        }
        let maxExcess = help.maxValue(graph.nodes.filter(elem => elem.label !== 0 && elem.label !== graph.nodes.length - 1), 'excess');
        while( maxExcess > deltaScale / 2 ) {
            let highExcessNodes = graph.nodes.filter(elem => elem.excess > deltaScale / 2 && elem.label !== graph.nodes.length - 1);
            for(let node of highExcessNodes) {
                stackPush(graph, node, deltaScale);
            }
            maxExcess = help.maxValue(graph.nodes.filter(elem => elem.label !== 0 && elem.label !== graph.nodes.length - 1), 'excess');
        }
        deltaScale /= 2.0;
    }

    return graph;
};