import { useContext } from "react";
import { Context } from "../../../Context";
import NavBarButtons from "../NavbarButtons";
import ThemeToggle from "../../../ThemeChanger";
import "./TopBar.css";

export function TopBar() {
	const ctx = useContext(Context);
	return (
		<>
			<header className="app-bar">

				<div className={`hamburger ${ctx?.isDrawerOpen ? 'open' : ''}`}
					onClick={() => ctx?.setDrawerOpen(!ctx?.isDrawerOpen)}
				>
					<span />
					<span />
					<span />
				</div>
				<div className="nav-bar__theme-toggle">
					<ThemeToggle />
				</div>
			</header>

			<aside className={`drawer ${ctx?.isDrawerOpen ? 'open' : ''}`}>
				<nav className="drawer__nav">
					<NavBarButtons onClick={() => ctx?.setDrawerOpen(false)} />
				</nav>
			</aside>
		</>
	);
}
