// import { useState, useEffect, useRef } from "react"
import DateHeader from "./DateHeader.tsx";
import {MenuPanel} from "../MenuPanel.tsx";
import {type Menu} from "../api.ts";

export function Menu({children}: {children: Record<string, Menu>}) {
    // const filtered = Object.entries(children)
    //   .filter(([_, menu]) =>
    //     // Filter only if at least one meal has at least one non-empty food group
    //     Object.values(menu).some(meal =>
    //       Object.values(meal).some(foodGroup =>
    //         Object.keys(foodGroup).length > 0
    //       )
    //     )
    //   );
    return (
        <>
            <DateHeader/>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <div style={{display: 'flex', flexDirection: 'row', overflow: 'scroll', marginTop: 0, padding: '0px 15px'}}>
                        {Object.entries(children).map(([location, menu]: [string, Menu], i: number) => (
                            <div key={location} style={{display: 'flex', overflow: 'visible', marginLeft: 10, marginBottom: 0, "--delay": `${i * 150}ms`} as React.CSSProperties}
                            >
                                <MenuPanel key={location} name={location} menu={menu} width="100%"></MenuPanel>
                            </div>
                        ))}
                </div>
            </div>
        </>
    );
}