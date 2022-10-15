import React, { useState, useEffect } from "react";
import { doesArcAlreadyExist } from "./commonHelpers";
import { Form } from "./form";

export const ByHand = (props) => {

    const [state, setState] = useState({ 
        graph: {
            nodes: [{
                label: 0,
                height: 0,
                excess: 0
            }, {
                label: 1,
                height: 0,
                excess: 0
            }],
            edges: []
        },
        greenFields: []
    });

    useEffect(() => props.generateGraph(state.graph), [state.graph]);

    /* Funkcija koja se pozove kada korisnik klikne na gumb za dodavanje novog brida */
    const addArc = () => {
        let startNode = parseInt(state.start), endNode = parseInt(state.end), flag = true;
        let tempEdges = state.graph.edges;
        for( let i = 0; i < tempEdges.length; i += 2 ) {
            if( startNode === tempEdges[i].startNode && endNode === tempEdges[i].endNode ) {
                tempEdges[i].capacity = parseInt(state.capacity);
                flag = false;
            }
        }

        if( flag ) {
            setState({
                ...state,
                graph: {
                    ...state.graph,
                    edges: [...state.graph.edges, {
                        startNode: parseInt(state.start),
                        endNode: parseInt(state.end),
                        capacity: parseInt(state.capacity),
                        flow: 0
                    }, {
                        startNode: parseInt(state.end),
                        endNode: parseInt(state.start),
                        capacity: 0,
                        flow: 0
                    }]
                }
            });
        } else {
            setState({
                ...state,
                graph: {
                    ...state.graph,
                    edges: tempEdges
                }
            });
        }
    };

    /* Dvije pomoćne metode za rukovanje promjenama */
    const setNewState = (fieldName, fieldValue) => {
        fieldName === 'nodes' ? setState({
                ...state,
                graph : {
                    ...state.graph,
                    nodes: addNodes(fieldValue)
                }
                })
            : setState({...state, [fieldName]: fieldValue});
    }

    const addNodes = (numOfNodes) => {
        let arr = [];
        for(let i = 0; i < numOfNodes; i++) {
            arr.push({
            label: parseInt(i),
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

    return (
        <div className="numInput">
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
            />
        </div>
    );
};