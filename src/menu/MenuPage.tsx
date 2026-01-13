
import {TopBar as MobileTopBar} from "../components/navbar/mobile/TopBar";
import {TopBar as DesktopTopBar} from "../components/navbar/desktop/TopBar";
import { Context } from "../Context";
import {Menu as MobileMenu} from './mobile/Menu';
import {Menu as DesktopMenu} from './desktop/Menu';
import {getAllLocationMenus, type Menu} from "./api";
import './Menu.css'
import '../components/loading/Loading.css';
import {Error, Loading} from "../components/loading/Loading";
import {useContext, useEffect, useState} from "react";

const dayOffsetCount = 7; // Number of days to fetch menus for

export default function MenuPage() {
    const contextValues = useContext(Context);
    const [menuData, setMenuData] = useState<Record<number, Record<string, Menu>>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    useEffect(() => {
        (async () => {
            const menus: Record<number, Record<string, Menu>> = {};

            for (let offset = 0; offset < dayOffsetCount; offset++) {
                const dayMenu = await getAllLocationMenus(offset);
                if (dayMenu) {
                    menus[offset] = dayMenu;
                }
            }

            // if (!dayMenu) {
            //     setError(true);
            //     setLoading(false);
            //     return;
            // }
            setMenuData(menus);
            setLoading(false);
        })()
    }, []);
        return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw'}}>
            {contextValues?.mobile ? (<MobileTopBar />) : (<DesktopTopBar />)}
            {/* <DateHeader/> */}
            
            
            <div style={{width: '100%', overflowX: 'scroll', flex: 1}}>
            {loading ? <Loading/> : error ? <Error>Error Loading Menus</Error> : (
                <div className="MenuPanelDelay" style={{ "--delay": `${1 * 115}ms` } as React.CSSProperties}>
                    {contextValues?.mobile ? (<MobileMenu>{menuData}</MobileMenu>) : (<DesktopMenu>{menuData}</DesktopMenu>)}
                </div>
            )}
            </div>
        </div>
    );
}