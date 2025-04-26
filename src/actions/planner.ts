'use server'

import db from '@/db';
import { eq, isNotNull, and, asc, desc } from 'drizzle-orm';

import { usersTable } from '@/db/schema/users';
import { plannerTable } from '@/db/schema/planner';

import { getUser } from '@/lib/sessions';
import { MyError, MyErrorObj } from '@/lib/myerror';

import { PlannerData, PlannerRow } from '@/app/planner/usePlanner';
import { plannerRowTable } from '@/db/schema/plannerrow';

export async function getPlannerData(): Promise<PlannerData | MyErrorObj>{
    const user = await getUser();
    if(user) {
        const planner = await db.select()
            .from(usersTable)
            .innerJoin(plannerTable, eq(usersTable.plannerId, plannerTable.id))
            .leftJoin(plannerRowTable, eq(plannerTable.id, plannerRowTable.plannerId))
            .where(eq(usersTable.id, user.id))
            .orderBy(
                asc(plannerRowTable.done), 
                asc(plannerRowTable.deadline),
                desc(plannerRowTable.motivation),
                asc(plannerRowTable.id)
            )
            
        if(planner.length) {
            const tasks: PlannerRow[] = [];
            planner.forEach(p => {
                if(p.planner_row) tasks.push(p.planner_row);
            })
            const plannerData: PlannerData = {tasks: tasks};
            return plannerData;
        } else { // create a planner row for user automatically for later
            const newPlanner = await db.insert(plannerTable).values({}).returning();
            await db.update(usersTable).set({plannerId: newPlanner[0].id}).where(eq(usersTable.id, user.id));
            return {tasks: []} as PlannerData;
        }
    } else {
        return MyError.create({message: 'Not logged in', authRequired: true});
    }
}

export async function deleteAllPlannerRows(): Promise<PlannerData | MyErrorObj> {
    const planner = await getUserPlanner();
    if(MyError.isInstanceOf(planner)) {
        return planner;
    } else {
        await db.delete(plannerRowTable).where(eq(plannerRowTable.plannerId, planner.planner.id));
        return await getPlannerData();
    }
}

export async function clearPlannerValues(): Promise<PlannerData | MyErrorObj> {
    const planner = await getUserPlanner();
    if(MyError.isInstanceOf(planner)) {
        return planner;
    } else {
        await db.update(plannerRowTable).set({motivation: 0, deadline: null, text: false})
            .where(eq(plannerRowTable.plannerId, planner.planner.id));
        return await getPlannerData();
    }
}

export async function checkAllPlannerRows(done: boolean): Promise<PlannerData | MyErrorObj> {
    const planner = await getUserPlanner();
    if(MyError.isInstanceOf(planner)) {
        return planner;
    } else {
        await db.update(plannerRowTable).set({done: done})
            .where(eq(plannerRowTable.plannerId, planner.planner.id));
        return await getPlannerData();
    }
}

interface PlannerRowUpdateType {
    id?: number;
    label: string;
    motivation: number;
    done: boolean;
    deadline: string | null;
    text: boolean;
}
export async function createUpdatePlannerRow(pr: PlannerRowUpdateType): Promise<PlannerData | MyErrorObj> {
    const planner = await getUserPlanner();
    if(MyError.isInstanceOf(planner)) {
        return planner;
    } else {
        if(pr.id) {
            const copy = JSON.parse(JSON.stringify(pr));
            delete copy.id;
            console.log('DEBUG');
            const update = await db.update(plannerRowTable).set({...copy, plannerId: planner.planner.id}).where(
                and(
                    eq(plannerRowTable.id, pr.id),
                    eq(plannerRowTable.plannerId, planner.planner.id)
                )).returning();
            if(update.length !== 1) {
                return MyError.create({message: 'Failed to update planner row'});
            }
        } else {
            const create = await db.insert(plannerRowTable).values({...pr, plannerId: planner.planner.id}).returning();
            if(create.length !== 1) {
                return MyError.create({message: 'Failed to create planner row'});
            }
        }
        return await getPlannerData();
    }
}

export async function deletePlannerRow(id: number): Promise<PlannerData | MyErrorObj> {
    const planner = await getUserPlanner();
    if(MyError.isInstanceOf(planner)) {
        return planner;
    } else {
        await db.delete(plannerRowTable).where(and(
            eq(plannerRowTable.plannerId, planner.planner.id),
            eq(plannerRowTable.id, id)
        ));
        return await getPlannerData();
    }
}

async function getUserPlanner() {
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
            return planner[0];
        } else {
            return MyError.create({message: 'Your planner somehow doesn\'t exist'});
        }
    } else {
        return MyError.create({message: 'Not logged in', authRequired: true});
    }
}