import { getPlannerData } from '@/actions/planner';
import PlannerComponent from './Planner';
import { Suspense } from 'react';
import { LoadingScreenFallBack } from '@/components/LoadingScreen';
import { MyError } from '@/lib/myerror';

export default function Page() {
    return <Suspense fallback={<LoadingScreenFallBack/>}>
        <PlannerLoader/>
    </Suspense>;
}

async function PlannerLoader() {
    const resp = await getPlannerData();
    const plannerData = (resp instanceof MyError) ? undefined : resp;
    return <PlannerComponent initPlannerData={plannerData}/>
}