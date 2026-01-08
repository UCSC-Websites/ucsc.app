
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
import DateHeader from "./DateHeader";



export default function MenuPage() {
    const contextValues = useContext(Context);
    const [menuData, setMenuData] = useState<Record<string, Menu>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    useEffect(() => {
        (async () => {
            const menu = await getAllLocationMenus(0);

            if (!menu) {
                setError(true);
                setLoading(false);
                return;
            }
            setMenuData(menu);
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