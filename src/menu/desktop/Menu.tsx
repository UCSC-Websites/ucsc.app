// import { useState, useEffect, useRef } from "react"
import DateHeader from "./DateHeader.tsx";
import {MenuPanel} from "../MenuPanel.tsx";
import {type Menu} from "../api.ts";
import {useContext} from "react";
import {Context} from "../../Context.tsx";

export function Menu({children}: {children: Record<number, Record<string, Menu>>}) {
    // const filtered = Object.entries(children)
    //   .filter(([_, menu]) =>
    //     // Filter only if at least one meal has at least one non-empty food group
    //     Object.values(menu).some(meal =>
    //       Object.values(meal).some(foodGroup =>
    //         Object.keys(foodGroup).length > 0
    //       )
    //     )
    //   );

    // const {selectedDateOffset, setSelectedDateOffset} = useContext(Context);
    const ctx = useContext(Context);
    if (!ctx) {
        return null;
    }
    const {selectedDateOffset, setSelectedDateOffset} = ctx;
    
    return (
        <>
            <DateHeader/>
            <div style={{overflow: 'scroll', marginTop: 150}}>
                {Object.entries(children).map(([offset, dayMenu]) => (
                    <a href={"dayOffset" + offset} id={'dayOffset' + offset}
                        style={{textDecoration: 'none', color: 'inherit', scrollMarginTop: 210}}
                        onClick={(e) => {
                            e.preventDefault();
                        }}>
                        <div key={offset} style={{display: 'flex', flexDirection: 'row',marginTop: 0, padding: '0px 15px'}}>
                            {Object.entries(dayMenu).map(([location, menu]: [string, Menu], i: number) => (
                                <div key={location} style={{display: 'flex', overflow: 'visible', marginLeft: 10, marginBottom: 0, "--delay": `${i * 150}ms`} as React.CSSProperties}>
                                    <MenuPanel key={location} name={location} menu={menu} width="100%"></MenuPanel>
                                </div>
                            ))}
                        </div>
                    </a>
                ))}
            </div>
        </>
    );
}