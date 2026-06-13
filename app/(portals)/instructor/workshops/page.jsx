import { getCurrentUser } from "../../../../lib/auth";
import { listWorkshopsForInstructor, bookedCountsForInstructor } from "../../../../lib/db";
import { WORKSHOPS } from "../data";
import WorkshopsClient from "./WorkshopsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Workshops · Instructor · Thayya™" };

export default async function InstructorWorkshops() {
  const user = await getCurrentUser();
  const instructorId = user?.instructorId;

  const workshops = instructorId ? await listWorkshopsForInstructor(instructorId) : [];
  const booked = instructorId ? await bookedCountsForInstructor(instructorId) : {};

  // attach booked count to each row for the client
  const items = workshops.map((w) => ({ ...w, bookedCount: booked[w.id] || 0 }));

  return (
    <WorkshopsClient
      initialItems={items}
      overline={WORKSHOPS.overline}
      title={WORKSHOPS.title}
      cta={WORKSHOPS.cta}
    />
  );
}
