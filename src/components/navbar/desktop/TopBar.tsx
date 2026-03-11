import { Context } from '../../../Context';
import { useContext } from 'react';
import ThemeToggle from '../../../ThemeChanger';
import NavBarButtons from '../NavbarButtons';
import './TopBar.css';

export function TopBar() {
	const ctx = useContext(Context);

    return (
        <>
            <header className="app-bar">
                <nav className="nav-bar__nav">
                    <NavBarButtons onClick={() => ctx?.setDrawerOpen(false)} />
                </nav>
                <div className="nav-bar__theme-toggle">
                    <ThemeToggle />
                </div>
            </header>
        </>
    );
}
