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

    const today = new Date();
    const mobileTodayDisplay = `Menus for ${weekdays[today.getDay()]}`;
    const desktopTodayDisplay = `Menus for ${weekdays[today.getDay()]}, ${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

    return (
        <>
        <div className="dateHeader" style={{position: contextValues?.mobile ? 'fixed' : 'unset', width: '100%', zIndex: 499, fontSize: 36, marginTop: 60, color: 'var(--gold)', fontWeight: 'bold', textAlign: 'center' }}> 
            {contextValues?.mobile ? mobileTodayDisplay : desktopTodayDisplay}
        </div>

        {contextValues?.mobile ? <div className="dateHeader filler" style={{width: '100%', zIndex: 1000, fontSize: 36, marginTop: 60, color: 'var(--gold)', fontWeight: 'bold', textAlign: 'center' }}> 
            {contextValues?.mobile ? mobileTodayDisplay : desktopTodayDisplay}
        </div>
        : null}
        </>
    );
}