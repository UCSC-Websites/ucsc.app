import { useContext } from "react";
import { Context } from "../../../Context";
import NavBarButtons from "../NavbarButtons";
import ThemeToggle from "../../../ThemeChanger";
import "./TopBar.css";

export function TopBar() {
	const ctx = useContext(Context);
	return (
		<>
			<header className="top-bar">
				<div />

				<div
					className={`hamburger ${ctx?.isDrawerOpen ? "open" : ""}`}
					onClick={() => ctx?.setDrawerOpen(!ctx?.isDrawerOpen)}
				>
					<span />
					<span />
					<span />
				</div>

				<ThemeToggle />

				<aside className={`drawer ${ctx?.isDrawerOpen ? "open" : ""}`}>
					<nav className="drawer__nav">
						<NavBarButtons
							onClick={() => ctx?.setDrawerOpen(false)}
						/>
					</nav>
				</aside>
			</header>
		</>
	);
}
