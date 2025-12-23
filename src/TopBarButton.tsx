import {Link} from "react-router-dom";

export default function TopBarButton({children}: {children: string}) {
    return (
        <Link to={`/${children}`} style={{textDecoration: 'none'}}>{children}</Link>
        // <a href='.' onClick={() => {
        //     if (children === 'ucsc.info') {
        //         navigate('/');
        //     } else {
        //         navigate(`/${children}`);
        //     }
        // }}>{children}</a>
    );
}

// export default function TopBarButton({children}: {children: string}) {
//     // const navigate = useNavigate();
//     // const cv = useContext(Context);
//     // const hostname = window.location.hostname;
//     // const url = hostname.split('.')[1];

//     // let url = window.location.origin
//     const newDomain = window.location.protocol + '//' + children + '.' + (window.location.host.split('.').slice(-1).join('.'));

//     return (
        
//         <a href={newDomain} onClick={(e) => {
//             e.preventDefault();
//             if (children === 'ucsc.info') {
//                 window.location.href = newDomain;
//             } else {
//                 window.location.href = newDomain //`${children}.${url}`;
//             }
//         }}>{children}</a>
//         // <Link to={`${children}.${hostname}`} style={{textDecoration: 'none'}}>{children}</Link>

//     );
// }