export default function MealHeader({children}: {children: string}) {
    // Dinner
    return (
        <div className="mealName" style={{color: 'var(--gold)', justifyContent: 'center', marginBottom: 0, marginTop: 0, fontWeight: 'normal', fontSize: 22 }}>{children}</div>
    );
}