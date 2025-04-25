import { getPlannerData } from '@/actions/planner';
import PlannerComponent from './Planner';
import { Suspense } from 'react';
import { LoadingScreenFallBack } from '@/components/LoadingScreen';
import { MyError } from '@/lib/myerror';
import { redirect } from 'next/navigation';

export default function Page() {
    return <Suspense fallback={<LoadingScreenFallBack/>}>
        <PlannerLoader/>
    </Suspense>;
}

async function PlannerLoader() {
    const resp = await getPlannerData();
    if(MyError.isInstanceOf(resp)) {
        if(resp.authRequired) {
            redirect('/login?redirect=/planner');
        } else {
            return <span>{resp.message}</span>
        }
    } else {
        return <PlannerComponent initPlannerData={resp}/>
    }
}