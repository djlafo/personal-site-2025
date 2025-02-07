import { getPlannerData } from '@/actions/planner';
import PlannerComponent from './Planner';
import { Suspense } from 'react';
import { LoadingScreenFallBack } from '@/components/LoadingScreen';

export default function Page() {
    return <Suspense fallback={<LoadingScreenFallBack/>}>
        <PlannerLoader/>
    </Suspense>;
}

async function PlannerLoader() {
    const plannerData = await getPlannerData();
    return <PlannerComponent initPlannerData={plannerData}/>
}