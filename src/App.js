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
      edges: []
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
  //const arcRef = useRef(null);
  const pushRelRef = useRef(null);
  const fifoRef = useRef(null);
  const excessScalingRef = useRef(null);
  const waveScalingRef = useRef(null);

  /* Privremeno potrebna funkcija, ispisuje sve bridove na ekran */
  //const printArcs = () => arcRef.current.innerText = ('Arcs: ' + ( state.graphForAlgs.edges && state.graphForAlgs.edges.length !== 0 ? state.graphForAlgs.edges.map(curr => curr.startNode + ' -> ' + curr.endNode + ', ' + curr.capacity + '; ', '') : '' ) );

  /* Funkcija koja se pozove svaki put kada se array koji sadrži bridove promijeni */
  //useEffect(() => { arcRef.current.innerText = printArcs() }, [state.graphForAlgs.edges]);

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

    for(let [edgeInd, edge] of state.graphForAlgs.edges.entries()) {
      if(parseInt(edge.capacity) > 0) {
        graph.edges.push({
          from: parseInt(edge.startNode),
          to: parseInt(edge.endNode),
          id: parseInt(edgeInd),
          label: edge.flow + '/' + edge.capacity,
          font: { align: edge.startNode < edge.endNode ? "top" : "bottom" }
        });
      }
    }

    setState(prevState => ({
      ...prevState,
      graph: graph
    }));
  }, [state.graphForAlgs]);

  const generateGraph = (graph) => setState({ ...state, graphForAlgs: graph });

  const getEdges = (resultGraph, totalFlow) => {
    let edges = [];
    for(let [edgeInd, edge] of resultGraph.edges.entries()) {
      if(parseInt(edge.capacity) > 0) {
        edges.push({
          from: parseInt(edge.startNode),
          to: parseInt(edge.endNode),
          id: parseInt(edgeInd),
          label: edge.flow + '/' + edge.capacity,
          font: { align: "top"/*edge.startNode < edge.endNode  ? "top" : "bottom"*/ },
          value: parseFloat(edge.flow) / parseFloat(totalFlow)
        });
      }
    }
    return edges;
  }

  /* Metode koje ispisuju maksimalan tok na ekran nakon što se izračuna */
  const calculateMaxFlow = () => {
    let start = new Date();
    let result = pushRelabel(structuredClone(state.graphForAlgs));
    let end = new Date();
    let totalFlow = result.edges.reduce((partialSum, elem) => partialSum + (elem.startNode === 1 && elem.endNode !== 1 ? elem.flow : 0), 0);
    setState(prevState => ({
      ...prevState,
      graph: {
        ...prevState.graph,
        edges: getEdges(result, totalFlow)
      }
    }));
    pushRelRef.current.innerHTML = 'Max flow: ' + totalFlow + '<br /> Time elapsed: ' + (end - start) + 'ms';
  };

  const calculateFifoMaxFlow = () => {
    let start = new Date();
    let result = fifoPushRelabel(structuredClone(state.graphForAlgs));
    let end = new Date();
    let totalFlow = result.edges.reduce((partialSum, elem) => partialSum + (elem.startNode === 1 && elem.endNode !== 1 ? elem.flow : 0), 0);
    setState(prevState => ({
      ...prevState,
      graph: {
        ...prevState.graph,
        edges: getEdges(result, totalFlow)
      }
    }));
    fifoRef.current.innerHTML = 'Fifo max flow: ' + totalFlow + '<br /> Time elapsed: ' + (end - start) + 'ms';
  };

  const calculateExcessScalingMaxFlow = () => {
    let start = new Date();
    let result = excessScalingPushRelabel(structuredClone(state.graphForAlgs));
    let end = new Date();
    let totalFlow = result.edges.reduce((partialSum, elem) => partialSum + (elem.startNode === 1 && elem.endNode !== 1 ? elem.flow : 0), 0);
    setState(prevState => ({
      ...prevState,
      graph: {
        ...prevState.graph,
        edges: getEdges(result, totalFlow)
      }
    }));
    excessScalingRef.current.innerHTML = 'Excess scaling max flow: ' + totalFlow + '<br /> Time elapsed: ' + (end - start) + 'ms';
  };

  const calculateWaveScalingMaxFlow = () => {
    let start = new Date();
    let result = waveScalingPushRelabel(structuredClone(state.graphForAlgs));
    let end = new Date();
    let totalFlow = result.edges.reduce((partialSum, elem) => partialSum + (elem.startNode === 1 && elem.endNode !== 1 ? elem.flow : 0), 0);
    setState(prevState => ({
      ...prevState,
      graph: {
        ...prevState.graph,
        edges: getEdges(result, totalFlow)
      }
    }));
    waveScalingRef.current.innerHTML = 'Wave scaling max flow: ' + totalFlow + '<br /> Time elapsed: ' + (end - start) + 'ms';
  };

  const mySetEdges = () => {
    let edges = [];
    for(let row = 0; row < 40; row++) {
      for(let col = row + 1; col < 40; col++) {
        edges.push({
          startNode: parseInt(row) + 1,
          endNode: parseInt(col) + 1,
          capacity: parseInt(col) + parseInt(row) + 2,
          flow: 0
        }, {
          startNode: parseInt(col) + 1,
          endNode: parseInt(row) + 1,
          capacity: 0,
          flow: 0
        });
      }
    }
    return edges;
  }

  const mySetNodes = () => {
    let nodes = [];
    for(let row = 0; row < 40; row++) {
      nodes.push({
        label: parseInt(row),
        height: 0,
        excess: 0
      });
    }
    return nodes;
  }

  const insertBigGraphNodes = () => setState(prevState => ({
    ...prevState,
    graphForAlgs: {
      ...prevState.graphForAlgs,
      nodes: mySetNodes()
    }
  }));

  const insertBigGraphEdges = () => setState(prevState => ({
    ...prevState,
    graphForAlgs: {
      ...prevState.graphForAlgs,
      edges: mySetEdges()
    }
  }));

  let options = {
    edges: {
      smooth: {
        "type": "curvedCW",
        "forceDirection": "none",
        "roundness": 0.15
      },
      scaling: {
        min: 0,
        max: 2
      }
    }
  }

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
      {/*<div>
        <input type="button" value={'Insert'} onClick={insertBigGraphNodes} />
        <input type="button" value={'Insert'} onClick={insertBigGraphEdges} />
            </div><br /><br />*/}
      <div id="graphContainer">
        <div id="left">
          <Graph 
              graph={state.graph} 
              style={{"height": "55vh", "width": "126.5vh", "margin": "0", "padding": "0"}} 
              options={options}
          />
        </div>
        <div id="right">
          <div id="pushRelabel">
            <input type="button" value={'Push-relabel'} onClick={calculateMaxFlow} />
            <p ref={pushRelRef}>Max flow: <br /> Time elapsed: </p>
          </div>
          <div id="fifoPushRelabel">
            <input type="button" value={'Fifo push-relabel'} onClick={calculateFifoMaxFlow} />
            <p ref={fifoRef}>Fifo max flow: <br /> Time elapsed: </p>
          </div>
          <div id="excessPushRelabel">
            <input type="button" value={'Excess scaling push-relabel'} onClick={calculateExcessScalingMaxFlow} />
            <p ref={excessScalingRef}>Excess scaling max flow: <br /> Time elapsed: </p>
          </div>
          <div id="wavePushRelabel">
            <input type="button" value={'Wave scaling push-relabel'} onClick={calculateWaveScalingMaxFlow} />
            <p ref={waveScalingRef}>Wave scaling max flow: <br /> Time elapsed: </p>
          </div>
        </div>
      </div><br /> <br />
    </div>
  );
}

export default App;
