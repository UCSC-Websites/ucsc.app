
import { Menu } from "./api"
import FoodBlock from "./FoodBlock"
import MealHeader from "./MealHeader"

interface MenuPanelProps {
    menu: Menu
    name: string
    width?: string
}

export function MenuPanel(props: MenuPanelProps) {
    const locationMenus = Object.entries(props.menu).filter(
        ([_, meal]) => Object.keys(meal).length > 0 // Only include non-empty meals
      );
    return (
        <>
        <div className="menuPanel" style={{width: props.width ?? '100%', marginLeft: 0,
            padding: 0, borderRadius: 10, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            display: 'flex', flexDirection: 'column', overflowY: 'scroll', marginBottom: 30,
            minWidth: '300px'}}>
            <div style={{fontSize: 28, fontWeight: 'bold', margin: 0, padding: 20}}>{props.name}</div>
            {locationMenus.map(([mealName, meal]) =>
                Object.keys(meal).length > 0 ? (
                    <div key={mealName}>
                        <MealHeader>{mealName}</MealHeader>
                            {Object.entries(meal).map(([groupName, foodGroup]) =>
                            Object.keys(foodGroup).length > 0 ? (
                            <div key={groupName}>
                                <p className="groupName" style={{display: 'flex',
                                    fontSize: 15, marginBottom: 5, fontWeight: 'bold',
                                    marginLeft: 20, marginTop: 2.5, justifyContent: 'flex-start'}}>{groupName}</p>
                                <div style={{display: 'flex', flexWrap: 'wrap',
                                    gap: 0}}>
                                    {Object.entries(foodGroup).map(([foodName, foodItem]) => (
                                        <FoodBlock key={foodName}>{foodItem}</FoodBlock>
                                    ))}
                                </div>
                            </div>
                        ) : null
                        )}
                    </div>
                ) : null
                )}
            </div>
        </>
    )
}
    
    
    
    // export function MenuPanel(props: MenuPanelProps) {
    //     return (
    //         <>
    //         {Object.entries(props.menu).map(([mealName, meal]) => (
    //             <div key={mealName}>
    //             <h2>{mealName}</h2>
    //             {Object.entries(meal).map(([groupName, foodGroup]) => (
    //                 <div key={groupName}>
    //                 <h3>{groupName}</h3>
    //                 <ul>
    //                 {Object.entries(foodGroup).map(([foodName, foodItem]) => (
                        
    //                 ))}
    //                 </ul>
    //                 </div>
                    
    //             ))}
    //             </div>
    //         ))}
    //         </>
    //     )
    // }
    