import {FoodItem} from "./api";

const style = {
    // background: va,
    // color: 'black',
    fontSize: '0.8rem',
    // gap: '0.5rem',
    width: '93%',
    // overflow: 'hidden',
    textOverflow: 'wrap',
    whiteSpace: 'nowrap',
    paddingLeft: 15,
    paddingRight: 12.5,
    paddingTop: 0,
    paddingBottom: 0,
    margin: 0,
    lineHeight: 0.1,
    // marginTop: 0,
    // marginBottom: 0,
    // paddingVertical: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
}

export default function FoodBlock({children}: {children: FoodItem}) {
    return (
        <div style={style} className="foodBlock" key={children.name}>
            <div>
                <p style={{justifySelf: 'flex-start'}}>{children.name}</p>
            </div>
            
            <div style={{display: 'flex', justifyContent: 'flex-end',
                alignItems: 'center'}}>
                {children.restrictions.map((restriction: string) => (
                    <span style={{margin: 3, marginRight: 0, fontSize: 18}} key={restriction}>{restriction}</span>
                ))}
            </div>
        </div>
    );
}