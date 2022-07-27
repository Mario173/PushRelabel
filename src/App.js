import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import { Form } from './components/form';
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
    graph: {
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
    tabOne: true
  });

  /* Ref-ovi potrebni da bi dobili podatke iz DOM-a */
  const arcRef = useRef(null);
  const pushRelRef = useRef(null);
  const fifoRef = useRef(null);
  const excessScalingRef = useRef(null);
  const waveScalingRef = useRef(null);

  /* Privremeno potrebna funkcija, ispisuje sve bridove na ekran */
  const printArcs = () => arcRef.current.innerText = ('Arcs: ' + ( state.graph.arcs && state.graph.arcs.length !== 0 ? state.graph.arcs.map(curr => curr.startNode + ' -> ' + curr.endNode + ', ' + curr.capacity + '; ', '') : '' ) );

  /* Funkcija koja se pozove svaki put kada se array koji sadrži bridove promijeni */
  useEffect(() => { arcRef.current.innerText = printArcs() }, [state.graph.arcs]);

  const generateGraph = (graph) => setState({ ...state, graph: graph });

  /* Metode koje ispisuju maksimalan tok na ekran nakon što se izračuna */
  const calculateMaxFlow = () => {
    pushRelRef.current.innerText = 'Max flow: ' + pushRelabel(structuredClone(state.graph)).arcs.reduce((partialSum, elem) => partialSum + (elem.startNode === 1 && elem.endNode !== 1 ? Math.max(elem.flow, 0) : 0), 0);
  };

  const calculateFifoMaxFlow = () => {
    fifoRef.current.innerText = 'Fifo max flow: ' + fifoPushRelabel(structuredClone(state.graph)).arcs.reduce((partialSum, elem) => partialSum + (elem.startNode === 1 && elem.endNode !== 1 ? Math.max(elem.flow, 0) : 0), 0);
  };

  const calculateExcessScalingMaxFlow = () => {
    excessScalingRef.current.innerText = 'Excess scaling max flow: ' + excessScalingPushRelabel(structuredClone(state.graph)).arcs.reduce((partialSum, elem) => partialSum + (elem.startNode === 1 && elem.endNode !== 1 ? Math.max(elem.flow, 0) : 0), 0);
  };

  const calculateWaveScalingMaxFlow = () => {
    waveScalingRef.current.innerText = 'Wave scaling max flow: ' + waveScalingPushRelabel(structuredClone(state.graph)).arcs.reduce((partialSum, elem) => partialSum + (elem.startNode === 1 && elem.endNode !== 1 ? Math.max(elem.flow, 0) : 0), 0);
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
      <p id='nodes'>Number of nodes: { state.graph.nodes ? state.graph.nodes.length : 0 }</p><br />
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
  );
}

export default App;
