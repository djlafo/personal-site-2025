import { getPlannerData } from '@/actions/planner';
import PlannerComponent from './Planner';
import { Suspense } from 'react';
import { LoadingScreenOnly } from '@/components/LoadingScreen';

export default function Page() {
    return <Suspense fallback={<LoadingScreenOnly/>}>
        <PlannerLoader/>
    </Suspense>;
}

async function PlannerLoader() {
    const plannerData = await getPlannerData();
    return <PlannerComponent initPlannerData={plannerData}/>
}