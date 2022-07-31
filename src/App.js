import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import Graph from "react-graph-vis";
import { Matrix } from './components/matrix';
import { ByHand } from './components/byHand';
import { pushRelabel } from './algorithms/pushRelabel';
import { fifoPushRelabel } from './algorithms/fifoPushRelabel';
import { excessScalingPushRelabel } from './algorithms/excessScalingPushRelabel';
import { waveScalingPushRelabel } from './algorithms/waveScalingPushRelabel';

let App = () => {
  /* 
    Graf se sastoji od vrhova i bridova, na početku samo izvor i ponor
    Za svaki vrh čuvamo njegovu visinu i višak, te informaciju o tome je li aktivan ili nije
    Za svaki brid čuvamo koji vrh mu je početni, a koji krajnji, kapacitet tog brida i trenutačni tok
  */
  const [state, setState] = useState({ 
    graphForAlgs: {
      nodes: [{
        height: 0,
        excess: 0
      }, {
        height: 0,
        excess: 0
      }],
      arcs: []
    },
    greenFields: [],
    tabOne: true,
    graph: {
      nodes: [{
        id: 1,
        label: 's',
        title: 'Source of the flow'
      }, {
        id: 2,
        label: 't',
        title: 'Sink for the flow'
      }],
      edges: []
    }
  });

  /* Ref-ovi potrebni da bi dobili podatke iz DOM-a */
  const arcRef = useRef(null);
  const pushRelRef = useRef(null);
  const fifoRef = useRef(null);
  const excessScalingRef = useRef(null);
  const waveScalingRef = useRef(null);

  /* Privremeno potrebna funkcija, ispisuje sve bridove na ekran */
  const printArcs = () => arcRef.current.innerText = ('Arcs: ' + ( state.graphForAlgs.arcs && state.graphForAlgs.arcs.length !== 0 ? state.graphForAlgs.arcs.map(curr => curr.startNode + ' -> ' + curr.endNode + ', ' + curr.capacity + '; ', '') : '' ) );

  /* Funkcija koja se pozove svaki put kada se array koji sadrži bridove promijeni */
  useEffect(() => { arcRef.current.innerText = printArcs() }, [state.graphForAlgs.arcs]);

  /* Funkcija koja se pozove svaki put kada se promijeni neki dio grafa i iscrta promijenjeni graf */
  useEffect(() => {
    let graph = {
      nodes: [{
        id: 1,
        label: 's',
        title: 'Source of the flow'
      }],
      edges: []
    };

    for(let i = 1; i < state.graphForAlgs.nodes.length - 1; i++) {
      graph.nodes.push({
        id: parseInt(i) + 1,
        label: (parseInt(i) + 1).toString()
      });
    }

    graph.nodes.push({
      id: parseInt(state.graphForAlgs.nodes.length),
      label: 't',
      title: 'Sink for the flow'
    });

    for(let [arcInd, arc] of state.graphForAlgs.arcs.entries()) {
      if(parseInt(arc.capacity) > 0) {
        graph.edges.push({
          from: parseInt(arc.startNode),
          to: parseInt(arc.endNode),
          id: parseInt(arcInd),
          label: arc.flow + '/' + arc.capacity,
          font: { align: arc.startNode < arc.endNode ? "top" : "bottom" }
        });
      }
    }

    setState(prevState => ({
      ...prevState,
      graph: graph
    }));
  }, [state.graphForAlgs]);

  const generateGraph = (graph) => setState({ ...state, graphForAlgs: graph });

  const getEdges = (resultGraph) => {
    let edges = [];
    for(let [arcInd, arc] of resultGraph.arcs.entries()) {
      if(parseInt(arc.capacity) > 0) {
        edges.push({
          from: parseInt(arc.startNode),
          to: parseInt(arc.endNode),
          id: parseInt(arcInd),
          label: arc.flow + '/' + arc.capacity,
          font: { align: arc.startNode < arc.endNode ? "top" : "bottom" }
        });
      }
    }
    return edges;
  }

  /* Metode koje ispisuju maksimalan tok na ekran nakon što se izračuna */
  const calculateMaxFlow = () => {
    let result = pushRelabel(structuredClone(state.graphForAlgs));
    setState(prevState => ({
      ...prevState,
      graph: {
        ...prevState.graph,
        edges: getEdges(result)
      }
    }));
    pushRelRef.current.innerText = 'Max flow: ' + result.arcs.reduce((partialSum, elem) => partialSum + (elem.startNode === 1 && elem.endNode !== 1 ? Math.max(elem.flow, 0) : 0), 0);
  };

  const calculateFifoMaxFlow = () => {
    let result = fifoPushRelabel(structuredClone(state.graphForAlgs));
    setState(prevState => ({
      ...prevState,
      graph: {
        ...prevState.graph,
        edges: getEdges(result)
      }
    }));
    fifoRef.current.innerText = 'Fifo max flow: ' + result.arcs.reduce((partialSum, elem) => partialSum + (elem.startNode === 1 && elem.endNode !== 1 ? Math.max(elem.flow, 0) : 0), 0);
  };

  const calculateExcessScalingMaxFlow = () => {
    let result = excessScalingPushRelabel(structuredClone(state.graphForAlgs));
    setState(prevState => ({
      ...prevState,
      graph: {
        ...prevState.graph,
        edges: getEdges(result)
      }
    }));
    excessScalingRef.current.innerText = 'Excess scaling max flow: ' + result.arcs.reduce((partialSum, elem) => partialSum + (elem.startNode === 1 && elem.endNode !== 1 ? Math.max(elem.flow, 0) : 0), 0);
  };

  const calculateWaveScalingMaxFlow = () => {
    let result = waveScalingPushRelabel(structuredClone(state.graphForAlgs));
    setState(prevState => ({
      ...prevState,
      graph: {
        ...prevState.graph,
        edges: getEdges(result)
      }
    }));
    waveScalingRef.current.innerText = 'Wave scaling max flow: ' + result.arcs.reduce((partialSum, elem) => partialSum + (elem.startNode === 1 && elem.endNode !== 1 ? Math.max(elem.flow, 0) : 0), 0);
  };

  return (
    <div className="App">
      <h2>Maximum Flow Algorithms</h2>
      <div className='InputPart'>
        <div className="Tabs">
          {/* Tab nav */}
          <ul className="nav">
            <li onClick={() => setState({...state, tabOne: true})}>Insert graph</li>
            <li onClick={() => setState({...state, tabOne: false})}>Insert graph using a matrix</li>
          </ul>
          <div className="outlet">
            { state.tabOne ? (<ByHand 
              generateGraph={generateGraph}
            />) :
            (<Matrix 
              generateGraph={generateGraph}
              btnValue={'Generate graph!'}
            />) }
            <br />
          </div>
        </div>
      </div>
      <div id="graphContainer">
        <div id="left">
          <Graph graph={state.graph} style={{"height": "18em", "width": "37em"}} />
        </div>
        <div id="right">
          <p id='nodes'>Number of nodes: { state.graphForAlgs.nodes ? state.graphForAlgs.nodes.length : 0 }</p><br />
          <p ref={arcRef}>Arcs: </p><br />
          <input type="button" value={'Push relabel'} onClick={calculateMaxFlow} />
          <p ref={pushRelRef}>Max flow: </p> <br />
          <input type="button" value={'Fifo push relabel'} onClick={calculateFifoMaxFlow} />
          <p ref={fifoRef}>Fifo max flow: </p> <br />
          <input type="button" value={'Excess scaling push relabel'} onClick={calculateExcessScalingMaxFlow} />
          <p ref={excessScalingRef}>Excess scaling max flow: </p>
          <input type="button" value={'Wave scaling push relabel'} onClick={calculateWaveScalingMaxFlow} />
          <p ref={waveScalingRef}>Wave scaling max flow: </p>
        </div>
      </div>
    </div>
  );
}

export default App;
