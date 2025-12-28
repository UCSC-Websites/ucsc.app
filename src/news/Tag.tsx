// import { useContext } from "react";
// import { Context } from "../Context";

export default function Tag({name}: {name: string}) {
	// const ctx = useContext(Context);

	return (
		<span style={{
			background: '#ffd700',
			marginRight: '2px',
			color: '#000000',
			borderRadius: '10px',
			fontSize: '12px',
			padding: '3px',
			whiteSpace: 'nowrap',
			marginTop: '2px'
		}}>
			{name}
		</span>
	)
}