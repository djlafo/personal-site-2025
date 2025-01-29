import { getPlannerData } from '@/actions/planner';
import PlannerComponent from './Planner';

// preload planner data for user
export default async function Planner() {
    'use server'
    const plannerData = await getPlannerData();
    return <PlannerComponent initPlannerData={plannerData}/>
}