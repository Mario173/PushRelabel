import React, { useState, useEffect } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from '@mui/material';
import { inputValidation } from './commonHelpers';

export const Matrix = (props) => {
    const [state, setState] = useState({
        infoHover: false,
        inputText: null,
        greenField: false,
        isHover: false,
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
        }
    });

    useEffect(() => props.generateGraph(state.graph), [state.graph]);

    const generateGraph = () => {
        state.greenField = true;
        let capacities = [];
        let lines = state.inputText.value.split('}');

        for(let lineInd in lines) {
            if(lineInd !== lines.length - 1 && lines[lineInd].trim() !== '') {
                capacities.push([]);
                lines[lineInd] = lines[lineInd].replace(/{/g, '');
                let capacitiesStr = lines[lineInd].split(',');
                for(let ind in capacitiesStr) {
                    capacitiesStr[ind] = capacitiesStr[ind].trim();
                    if(capacitiesStr[ind] !== '') {
                        let capacity = parseInt(capacitiesStr[ind]);
                        if(isNaN(capacity)) {
                            state.greenField = false;
                        }
                        capacities[lineInd].push(capacity);
                    }
                }
            }
        }

        if(state.greenField) {
            setState(prevState => ({
                ...prevState,
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
                }
            }));
            for(let row in capacities) {
                if(row > 1) {
                    setState(prevState => ({
                        ...prevState,
                        graph: {
                            ...prevState.graph,
                            nodes: [
                                ...prevState.graph.nodes, {
                                    label: parseInt(row),
                                    height: 0,
                                    excess: 0
                                }
                            ]
                        }
                    }));
                }
                for(let col = 0; col < capacities.length; col++) {
                    if(!isNaN(capacities[row][col]) && capacities[row][col] > 0) {
                        setState(prevState => ({
                            ...prevState,
                            graph: {
                                ...prevState.graph,
                                edges: [
                                    ...prevState.graph.edges, {
                                        startNode: parseInt(row) + 1,
                                        endNode: parseInt(col) + 1,
                                        capacity: parseInt(capacities[row][col]),
                                        flow: 0
                                    }, {
                                        startNode: parseInt(col) + 1,
                                        endNode: parseInt(row) + 1,
                                        capacity: 0,
                                        flow: 0
                                    }
                                ]
                            }
                        }));
                    }
                }
            }
        }
    };

    const checkField = (event) => setState({
        ...state,
        greenField: inputValidation(event.target.value)
    });

    const hoverStyle = (isAllowed) => ({
        backgroundColor: isAllowed ? 'rgba(9, 40, 197, 0.15)' : 'rgba(50, 224, 196, 0.15)', 
        cursor: isAllowed ? 'pointer' : 'default'
    });

    return (
        <div>
            <form id="formArcs" action="">
                <div id="matrixInput">
                    <label id="matrixLabel">Edges: </label>
                    <textarea 
                        cols="40" 
                        rows="5" 
                        name="edges" 
                        ref={node => (state.inputText = node)} 
                        onChange={checkField}
                        style={{ borderColor: state.greenField ? 'green' : 'red', outlineColor: state.greenField ? 'green' : 'red' }}
                    ></textarea>
                    
                    <Tooltip
                            title="Matrix input of the edges has to be done in a format &#x7B;&#x7B;0, 3&#x7D;, &#x7B;0, 2&#x7D;&#x7D;, which in this case represents a graph 
                            with two nodes and two edges, one whose start node is node 1, end node is node 2 and capacity 
                            is 3 and one whose start node is node 2, end node is node 2 and capacity is 2."
                            placement='right'
                            componentsProps={{ 
                                tooltip: { 
                                    sx: { 
                                        color: 'black',
                                        backgroundColor: '#32e0c426', 
                                        border: 1,
                                        borderColor: '#39A2DB'
                                    }, 
                                } 
                            }}
                    >
                        <FontAwesomeIcon
                            icon={faCircleInfo}
                        />
                    </Tooltip>
                </div>
                <br />
                <input 
                    type="button" 
                    onClick={generateGraph} 
                    onMouseEnter={() => setState({ ...state, isHover: true })}
                    onMouseLeave={() => setState({ ...state, isHover: false })}
                    value={'Generate graph!'} 
                    style={hoverStyle(state.greenField && state.isHover)} 
                />
            </form>
        </div>
    )
};