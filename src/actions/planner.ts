'use server'

import db from '@/db';
import { eq, isNotNull, and } from 'drizzle-orm';

import { usersTable } from '@/db/schema/users';
import { plannerTable } from '@/db/schema/planner';

import { getUser } from '@/lib/sessions';
import { MyError } from '@/lib/myerror';

import { PlannerData } from '@/app/planner/usePlanner';

export async function getPlannerData(): Promise<PlannerData | MyError>{
    const user = await getUser();
    if(user) {
        const planner = await db.select()
            .from(usersTable)
            .rightJoin(plannerTable, eq(usersTable.plannerId, plannerTable.id))
            .where(eq(usersTable.id, user.id))
            .limit(1);
        if(planner.length === 1) {
            return planner[0].planner.data as PlannerData;
        } else if (planner.length === 0) { // create a planner row for user automatically for later
            const newPlanner = await db.insert(plannerTable).values({}).returning();
            await db.update(usersTable).set({plannerId: newPlanner[0].id}).where(eq(usersTable.id, user.id));
            return newPlanner[0].data as PlannerData;
        } else {
            return new MyError({message: 'Somehow more than one planner has shown up'});
        }
    } else {
        return new MyError({message: 'Not logged in', authRequired: true});
    }
}

export async function savePlannerData(pd: PlannerData) {
    const user = await getUser();
    if(user) {
        const planner = await db.select()
            .from(usersTable)
            .rightJoin(plannerTable, eq(usersTable.plannerId, plannerTable.id))
            .where(and(
                eq(usersTable.id, user.id), 
                isNotNull(usersTable.plannerId)
            ))
            .limit(1);

        if(planner.length === 1) {
            const saved = await db.update(plannerTable).set({ data: pd }).where(eq(plannerTable.id, planner[0].planner.id)).returning();
            return saved[0].data as PlannerData;
        }
    }
    return new MyError({message: 'Not logged in', authRequired: true});
}