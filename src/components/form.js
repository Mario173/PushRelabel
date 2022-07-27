import React from "react";

export const Form = (props) => (
    <div>
        <p>{props.text}</p>

        {props.isArcs ? 
            (<form id="formArcs" action="">
                <label>
                    <span>Start node: </span>
                    <input type="number" name="start" onChange={props.onChange} min={1} max={props.numOfNodes} /><br />
                </label> 
                <label>
                    <span>End node: </span>
                    <input type="number" name="end" onChange={props.onChange} min={1} max={props.numOfNodes} /><br />
                </label>
                <label>
                    <span>Capacity: </span>
                    <input type="number" name="capacity" onChange={props.onChange} min={1} /><br /><br />
                </label>
                <input type="button" onClick={props.onClick} value={props.btnValue} disabled={!['start', 'end', 'capacity'].every(elem => props.greenFields.includes(elem))} />
            </form>) 
        : (<form id="formArcs" action="">
                Number of nodes: <input type="number" name="nodes" min={2} onChange={props.onChange} />
            </form>)
        }
    </div>
);