import { getCurrentUser } from "../../../../lib/auth";
import { listStudentsForInstructor } from "../../../../lib/db";
import { STUDENTS } from "../data";
import StudentsClient from "./StudentsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Students · Instructor · Thayya™" };

export default async function InstructorStudents() {
  const user = await getCurrentUser();
  const instructorId = user?.instructorId;

  const rows = instructorId ? await listStudentsForInstructor(instructorId) : [];

  return (
    <StudentsClient
      rows={rows}
      overline={STUDENTS.overline}
      title={STUDENTS.title}
      filterLabel={STUDENTS.filter}
    />
  );
}
