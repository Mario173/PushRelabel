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
  const pushRelRef = useRef(null);
  const fifoRef = useRef(null);
  const excessScalingRef = useRef(null);
  const waveScalingRef = useRef(null);

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
          font: { align: "top" },
          value: parseFloat(edge.flow) / parseFloat(totalFlow)
        });
      }
    }
    return edges;
  }

  /* Metoda koje ispisuju maksimalan tok na ekran nakon što se izračuna */
  const calculateFlow = (algorithm, ref, text) => {
    let start = new Date();
    let result = algorithm(structuredClone(state.graphForAlgs));
    let end = new Date();
    let totalFlow = result.edges.reduce((partialSum, elem) => partialSum + (elem.startNode === 1 && elem.endNode !== 1 ? elem.flow : 0), 0);
    setState(prevState => ({
      ...prevState,
      graph: {
        ...prevState.graph,
        edges: getEdges(result, totalFlow)
      }
    }));
    ref.current.innerHTML = text + totalFlow + '<br /> Time elapsed: ' + (end - start) + 'ms';
  };

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

  const clearText = () => {
    pushRelRef.current.innerHTML = 'Max flow: <br /> Time elapsed: ';
    fifoRef.current.innerHTML = 'Fifo max flow: <br /> Time elapsed: ';
    excessScalingRef.current.innerHTML = 'Excess scaling max flow: <br /> Time elapsed: ';
    waveScalingRef.current.innerHTML = 'Wave scaling max flow: <br /> Time elapsed: ';
  }

  return (
    <div className="App">
      <h2>Maximum Flow Algorithms</h2>
      <div className='InputPart'>
        <div className="Tabs">
          {/* Tab nav */}
          <ul className="nav">
            <li onClick={() => { setState({...state, tabOne: true}); clearText(); }}>Insert graph</li>
            <li onClick={() => { setState({...state, tabOne: false}); clearText(); }}>Insert graph using a matrix</li>
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
          <Graph 
              graph={state.graph} 
              style={{"height": "55vh", "width": "126.5vh", "margin": "0", "padding": "0"}} 
              options={options}
          />
        </div>
        <div id="right">
          <div id="pushRelabel">
            <input type="button" value={'Push-relabel'} onClick={() => calculateFlow(pushRelabel, pushRelRef, 'Max flow: ')} />
            <p ref={pushRelRef}>Max flow: <br /> Time elapsed: </p>
          </div>
          <div id="fifoPushRelabel">
            <input type="button" value={'Fifo push-relabel'} onClick={() => calculateFlow(fifoPushRelabel, fifoRef, 'Fifo max flow: ')} />
            <p ref={fifoRef}>Fifo max flow: <br /> Time elapsed: </p>
          </div>
          <div id="excessPushRelabel">
            <input type="button" value={'Excess scaling push-relabel'} onClick={() => calculateFlow(excessScalingPushRelabel, excessScalingRef, 'Excess scaling max flow: ')} />
            <p ref={excessScalingRef}>Excess scaling max flow: <br /> Time elapsed: </p>
          </div>
          <div id="wavePushRelabel">
            <input type="button" value={'Wave scaling push-relabel'} onClick={() => calculateFlow(waveScalingPushRelabel, waveScalingRef, 'Wave scaling max flow: ')} />
            <p ref={waveScalingRef}>Wave scaling max flow: <br /> Time elapsed: </p>
          </div>
        </div>
      </div><br /> <br />
    </div>
  );
}

export default App;
