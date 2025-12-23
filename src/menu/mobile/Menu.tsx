// import { useState, useEffect, useRef } from "react"
import {useContext} from "react";
import {MenuPanel} from "../MenuPanel.tsx";
import {type Menu} from "../api.ts";
import {Context} from "../../Context.tsx";
import {Swiper, SwiperSlide} from "swiper/react";
// @ts-expect-error gekrnhiowu
import 'swiper/css';

export function Menu({children}: {children: Record<string, Menu>}) {
    const contextValues = useContext(Context);
    const menuArrays = Object.entries(children);
    return (
        <>
            {/* <div style={{}}> */}
            <Swiper slidesPerView={1} spaceBetween={0}
                allowSlideNext={!contextValues?.drawer} allowSlidePrev={!contextValues?.drawer}
                style={{top: '75px'}}
            >
                {menuArrays.filter(([_, menu]) =>
                    // Filter only if at least one meal has at least one non-empty food group
                    Object.values(menu).some(meal =>
                      Object.values(meal).some(foodGroup =>
                        Object.keys(foodGroup).length > 0
                      )
                    )
                  ).map(([location, menu]: [string, Menu]) => (
                    <>
                    {/* <div key={location} style={{display: 'flex', overflow: 'visible', marginLeft: 10, marginBottom: 50, "--delay": `${i * 150}ms`} as React.CSSProperties}> */}
                    <SwiperSlide key={location as string} style={{maxHeight: '89vh', top: '0px', overflowY: 'scroll', overflowX: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'flex-start'}}>
                        <MenuPanel key={location} name={location} menu={menu} width="95%"></MenuPanel>
                    {/* <div style={{height: 500}}></div> */}
                    </SwiperSlide>
                    </>
                ))}
            </Swiper>
            {/* </div>q */}
        </>
    );
}