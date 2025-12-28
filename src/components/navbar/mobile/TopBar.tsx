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
				{/* <div className="app-bar__title">ucsc.info</div> */}
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

// this will need a shared state from the start
/*
export function TopBar() {
	const [opened, toggleNavbar] = useState(false);
	return (
		<AppShell
			header={{height: 50}}
			navbar={{width: 300, breakpoint: 'sm', collapsed: {mobile: !opened}}}
		>
			<AppShell.Header>
				<Group h="100%" px="md">
					<Burger opened={opened} onClick={() => {toggleNavbar(!opened)}}
						hiddenFrom="sm" size="sm" />
					<Text size="xl">ucsc.info</Text>
				</Group>
			</AppShell.Header>
			<AppShell.Navbar p="mid">
				<Text size="xl">
					holy fucking shit, 40000
				</Text>
				<Text size="xl">
					earthmover
				</Text>
				<Text size="xl">
					holy fucking shit, 40000
				</Text>
			</AppShell.Navbar>
		</AppShell>
	);
}
*/