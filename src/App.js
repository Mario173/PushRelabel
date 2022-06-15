import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import { Form } from './components/form';
import { pushRelabel } from './algorithms/pushRelabel';
import { fifoPushRelabel } from './algorithms/fifoPushRelabel';
import { excessScalingPushRelabel } from './algorithms/excessScalingPushRelabel';
import { waveScalingPushRelabel } from './algorithms/waveScalingPushRelabel';

let App = () => {
  /* 
    Graf se sastoji od vrhova i bridova, na početku samo izvor i ponor
    Za svaki vrh čuvamo njegovu visinu ivišak, te informaciju o tome je li aktivan ili nije
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
    greenFields: []
  });

  /* Ref-ovi potrebni da bi dobili podatke iz DOM-a */
  const arcRef = useRef(null);
  const pushRelRef = useRef(null);
  const fifoRef = useRef(null);
  const excessScalingRef = useRef(null);
  const waveScalingRef = useRef(null);

  /* Funkcija koja se pozove kada korisnik klikne na gumb za dodavanje novog brida */
  const addArc = () => {
      // provjeri za one šeme da oboja u crveno/zeleno i pazi na te vrijednosti dok se program izvodi (bez submita - onChange)
       if(state.start === state.end) {
        // arc cannot have same start and end node
      }  else if(false) {
        // ako već postoji taj brid
      } else {
        setState({
          ...state,
          graph: {
            ...state.graph,
            arcs: [...state.graph.arcs, {
              startNode: state.start,
              endNode: state.end,
              capacity: state.capacity,
              flow: 0
            }, {
              startNode: state.end,
              endNode: state.start,
              capacity: 0,
              flow: 0
            }]
          }
        });
      }
  };

  /* Privremeno potrebna funkcija, ispisuje sve bridove na ekran */
  const printArcs = () => arcRef.current.innerText = ('Arcs: ' + ( state.graph.arcs && state.graph.arcs.length !== 0 ? state.graph.arcs.map(curr => curr.startNode + ' -> ' + curr.endNode + ', ' + curr.capacity + '; ', '') : '' ) );

  /* Funkcija koja se pozove svaki put kada se array koji sadrži bridove promijeni */
  useEffect(() => { arcRef.current.innerText = printArcs() }, [state.graph.arcs]);

  /* Dvije pomoćne metode za rukovanje promjenama */
  const setNewState = (fieldName, fieldValue) => {
    fieldName === 'nodes' ? setState({
            ...state,
            graph : {
              ...state.graph,
              nodes: addNodes(fieldValue)
            }
          })
        : setState({...state, [fieldName]: fieldValue})
  }

  const addNodes = (numOfNodes) => {
    let arr = [];
    for(let i = 0; i < numOfNodes; i++) {
      arr.push({
        label: i,
        height: 0,
        excess: 0
      });
    }
    return arr;
  }

  /* Funkcija koja se brine za promjene stanja, točnije promjene kod vrhova i bridova */
  const handleChange = (event) => {
      let node = parseInt(event.target.value);

      if( ( (event.target.name === 'start' || event.target.name === 'end') && (node > 0 && node <= state.graph.nodes.length) )
          || (event.target.name === 'capacity' && node > 0) || (event.target.name === 'nodes' && node > 1) ) {
          if(state.greenFields.indexOf(event.target.name) === -1) {
            state.greenFields.push(event.target.name);
          }
          setNewState(event.target.name, node);
      } else {
        setState({
          ...state,
          greenFields: state.greenFields.filter(elem => elem !== event.target.name)
        });
      }
  };

  /* Metode koje ispisuju maksimalan tok na ekran nakon što se izračuna */
  const calculateMaxFlow = () => {
    pushRelRef.current.innerText = 'Max flow: ' + pushRelabel(structuredClone(state.graph)).arcs.reduce((partialSum, elem) => partialSum + (elem.startNode === 1 ? Math.max(elem.flow, 0) : 0), 0);
  };

  const calculateFifoMaxFlow = () => {
    fifoRef.current.innerText = 'Fifo max flow: ' + fifoPushRelabel(structuredClone(state.graph)).arcs.reduce((partialSum, elem) => partialSum + (elem.startNode === 1 ? Math.max(elem.flow, 0) : 0), 0);
  };

  const calculateExcessScalingMaxFlow = () => {
    excessScalingRef.current.innerText = 'Excess scaling max flow: ' + excessScalingPushRelabel(structuredClone(state.graph)).arcs.reduce((partialSum, elem) => partialSum + (elem.startNode === 1 ? Math.max(elem.flow, 0) : 0), 0);
  };

  const calculateWaveScalingMaxFlow = () => {
    waveScalingRef.current.innerText = 'Wave scaling max flow: ' + waveScalingPushRelabel(structuredClone(state.graph)).arcs.reduce((partialSum, elem) => partialSum + (elem.startNode === 1 ? Math.max(elem.flow, 0) : 0), 0);
  };

  return (
    <div className="App">
      Maximum Flow Algorithms
      <Form 
        isArcs={false}
        onChange={event => handleChange(event)}
        greenFields={state.greenFields}
      />
      <Form 
        isArcs={true}
        onClick={addArc}
        onChange={event => handleChange(event)}
        btnValue={'Add arc!'}
        numOfNodes={state.graph.nodes.length}
        greenFields={state.greenFields}
      /><br />
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
