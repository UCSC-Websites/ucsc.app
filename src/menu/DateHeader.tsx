import { useContext } from "react";
import { Context } from "../Context";
import './Menu.css';

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

const weekdays = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

export default function DateHeader() {
    const contextValues = useContext(Context);

    return (
        <>
        {contextValues?.mobile ? <DateHeaderBase fixed={true} /> : null}
        <DateHeaderBase fixed={false} />
        </>
    );
}

function DateHeaderBase({fixed = false}: {fixed?: boolean}) {
    const contextValues = useContext(Context);

    const today = new Date();
    const mobileTodayDisplay = `Menus for ${weekdays[today.getDay()]}`;
    const desktopTodayDisplay = `Menus for ${weekdays[today.getDay()]}, ${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
    return (
        <div className={`dateHeader`} style={{position: contextValues?.mobile && !fixed ? 'fixed' : 'unset', visibility: fixed ? 'hidden' : 'visible', width: '100%', marginTop: contextValues?.mobile ? 0 : 60, padding: 10, zIndex: 499, fontSize: contextValues?.mobile ? 32 : 32, color: 'var(--gold)', fontWeight: 'bold', textAlign: 'center' }}> 
            {contextValues?.mobile ? mobileTodayDisplay : desktopTodayDisplay}
        </div>
    )
}