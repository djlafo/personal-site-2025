import { getPlannerData } from '@/actions/planner';
import PlannerComponent from './Planner';
import { Suspense } from 'react';

export default function Page() {
    return <Suspense fallback='Loading planner data...'>
        <PlannerLoader/>
    </Suspense>;
}

async function PlannerLoader() {
    const plannerData = await getPlannerData();
    return <PlannerComponent initPlannerData={plannerData}/>
}