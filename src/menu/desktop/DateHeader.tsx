import '../Menu.css';
import {DateSelector} from "./DateSelector";



export default function DateHeader() {
    return (
        <>
            <div className={`dateHeader`} style={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: 60, textAlign: 'center'}}> 
                <div style={{padding: '15px 20px', width: '100%', position: 'fixed', backgroundColor: 'var(--bg-color)', zIndex: 499, boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.3)'}}>
                    <p style={{fontSize: 28, fontWeight: 'lighter', fontFamily: 'Verdana', margin: 0,  color: 'var(--gold)', textTransform: 'none'}}>Menus for</p>
                    <DateSelector/>
                </div>
            </div>
        </>
    );
}