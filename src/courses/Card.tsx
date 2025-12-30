import React from "react"
import './styles/Card.css'
import SinglePersonIconLightMode from '/icons/single-person-light-mode.svg';
import SinglePersonIconDarkMode from '/icons/single-person-dark-mode.svg';

import MultiplePeopleIconLightMode from '/icons/multiple-people-light-mode.svg';
import MultiplePeopleIconDarkMode from '/icons/multiple-people-dark-mode.svg';

import MapIconLightMode from '/icons/map-light-mode.svg';
import MapIconDarkMode from '/icons/map-dark-mode.svg';

import ClockIconLightMode from '/icons/clock-light-mode.svg'
import ClockIconDarkMode from '/icons/clock-dark-mode.svg'

import SunIconLightMode from '/icons/sun-light-mode.svg';
import SunIconDarkMode from '/icons/sun-dark-mode.svg';


import { Icon } from "../components/Icon";
import { statusEmoji } from "./StatusEmoji";

interface CardProps {
    classStatus: string,
    className: string,
    instructor: string,
    location: string,
    time: string,
    enrollment: string,
    summerSession: string | null,

    // used in callback
    term: string,
    classID: string,
    onCardClick: (term: string, classID: string) => void
}

const Card: React.FC<CardProps> = ({ classStatus, className, instructor, location, time, enrollment, summerSession, term, classID, onCardClick }) => {
    return (
        <div className="cardParent" onClick={() => { onCardClick(term, classID) }}>
            <div className="card">
                <div className="classInfo">
                    <div style={{display: "flex", width: "100%"}}>
                        <p style={{ margin: '-2px 0', textAlign: "left", width: "100%", overflowWrap: "break-word" }}>
                            <span style={{ fontWeight: '600' }}>{statusEmoji(classStatus)} {className}</span>
                        </p>
                    </div>
                    {document.documentElement.getAttribute('data-theme') === 'dark' ? (
                        <>
                            <Icon svg={SinglePersonIconDarkMode} data={instructor} />
                            <Icon svg={MapIconDarkMode} data={location} />
                            {time && <Icon svg={ClockIconDarkMode} data={time} />}
                            <Icon svg={MultiplePeopleIconDarkMode} data={enrollment} />
                            {summerSession && <Icon svg={SunIconDarkMode} data={summerSession} />}
                        </>
                    ) : (
                        <>
                            <Icon svg={SinglePersonIconLightMode} data={instructor} />
                            <Icon svg={MapIconLightMode} data={location} />
                            {time && <Icon svg={ClockIconLightMode} data={time} />}
                            <Icon svg={MultiplePeopleIconLightMode} data={enrollment} />
                            {summerSession && <Icon svg={SunIconLightMode} data={summerSession} />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Card;